<?php

namespace App\Services;

use App\Repositories\Interfaces\ExamRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;

class ExamService
{
    public function __construct(
        protected ExamRepositoryInterface $examRepository
    ) {}

    public function getPaginatedExams(array $filters = [], int $perPage = 10)
    {
        return $this->examRepository->getPaginated($filters, $perPage);
    }

    public function findExam(string $id)
    {
        return $this->examRepository->find($id);
    }

    public function findExamWithDetails(string $id)
    {
        $exam = $this->examRepository->findWithQuestionsAndOptions($id);
        if ($exam) {
            $exam->sessions = $this->examRepository->getExamSessions($id);
        }

        return $exam;
    }

    public function createExam(array $data)
    {
        return $this->examRepository->create($data);
    }

    public function updateExam(string $id, array $data)
    {
        return $this->examRepository->update($id, $data);
    }

    public function deleteExam(string $id)
    {
        return $this->examRepository->delete($id);
    }

    public function addQuestionToExam(string $examId, array $questionData, ?UploadedFile $imageFile = null, array $optionsData = [])
    {
        if ($imageFile) {
            $path = $imageFile->store('exams/questions', 'public');
            $questionData['image_path'] = $path;
        }

        return $this->examRepository->addQuestion($examId, $questionData, $optionsData);
    }

    public function updateQuestion(string $questionId, array $questionData, ?UploadedFile $imageFile = null, array $optionsData = [])
    {
        if ($imageFile) {
            $path = $imageFile->store('exams/questions', 'public');
            $questionData['image_path'] = $path;
        }

        return $this->examRepository->updateQuestion($questionId, $questionData, $optionsData);
    }

    public function deleteQuestion(string $questionId)
    {
        return $this->examRepository->deleteQuestion($questionId);
    }

    public function getPublishedExamsBySubject(string $subjectId)
    {
        return $this->examRepository->getPublishedExamsBySubject($subjectId);
    }

    public function startOrResumeExamSession(string $examId, string $studentId)
    {
        $exam = $this->examRepository->find($examId);
        if (! $exam || $exam->status !== 'published') {
            abort(404, 'Ujian tidak ditemukan atau belum diterbitkan.');
        }

        $now = now();
        $tzName = config('app.timezone', 'Asia/Jakarta');
        if ($exam->start_time && $now->lt(Carbon::parse($exam->start_time, $tzName))) {
            abort(403, 'Ujian ini belum dibuka. Akses ujian dibuka pada: '.Carbon::parse($exam->start_time, $tzName)->format('d M Y, H:i'));
        }

        if ($exam->end_time && $now->gt(Carbon::parse($exam->end_time, $tzName))) {
            abort(403, 'Ujian ini telah ditutup karena telah melewati batas waktu selesai ('.Carbon::parse($exam->end_time, $tzName)->format('d M Y, H:i').').');
        }

        $existingSession = $this->examRepository->getStudentExamSession($examId, $studentId);

        if ($existingSession) {
            if ($existingSession->status !== 'in_progress') {
                abort(403, 'Anda sudah mengumpulkan atau menyelesaikan ujian ini.');
            }
            $sessionId = $existingSession->id;
        } else {
            $sessionId = $this->examRepository->createExamSession($examId, $studentId);
        }

        $session = $this->examRepository->findExamSession($sessionId);

        if (! empty($session->is_expired)) {
            $this->examRepository->submitExamSession($sessionId);
            abort(403, 'Batas waktu ujian telah habis.');
        }

        $questions = $this->examRepository->getExamQuestionsForStudent(
            $examId,
            (bool) $exam->randomize_questions,
            (bool) $exam->randomize_options
        );

        $savedAnswersDict = $this->examRepository->getSavedStudentAnswers($sessionId);
        $savedAnswersList = array_values($savedAnswersDict->toArray());

        return [
            'session' => $session,
            'questions' => $questions,
            'saved_answers' => $savedAnswersDict,
            'saved_answers_list' => $savedAnswersList,
        ];
    }

    public function getExamSessionState(string $sessionId, string $studentId)
    {
        $session = $this->examRepository->findExamSession($sessionId);
        if (! $session || $session->student_id !== $studentId) {
            abort(403, 'Sesi pengerjaan tidak valid.');
        }

        $questions = $this->examRepository->getExamQuestionsForStudent(
            $session->exam_id,
            (bool) $session->randomize_questions,
            (bool) $session->randomize_options
        );

        $savedAnswersDict = $this->examRepository->getSavedStudentAnswers($sessionId);
        $savedAnswersList = array_values($savedAnswersDict->toArray());

        return [
            'session' => $session,
            'questions' => $questions,
            'saved_answers' => $savedAnswersDict,
            'saved_answers_list' => $savedAnswersList,
        ];
    }

    public function saveStudentAnswer(string $sessionId, string $studentId, string $questionId, ?string $selectedOptionId = null, ?string $essayAnswer = null)
    {
        $session = $this->examRepository->findExamSession($sessionId);
        if (! $session || $session->student_id !== $studentId) {
            abort(403, 'Sesi pengerjaan tidak valid.');
        }

        if ($session->status !== 'in_progress') {
            abort(403, 'Sesi ujian ini sudah selesai dan tidak dapat menerima jawaban.');
        }

        if (! empty($session->is_expired)) {
            $this->examRepository->submitExamSession($sessionId);
            abort(403, 'Batas waktu ujian telah habis.');
        }

        $this->examRepository->saveStudentAnswer($sessionId, $questionId, $selectedOptionId, $essayAnswer);
    }

    public function saveMultipleStudentAnswers(string $sessionId, string $studentId, array $answersList)
    {
        $session = $this->examRepository->findExamSession($sessionId);
        if (! $session || $session->student_id !== $studentId) {
            abort(403, 'Sesi pengerjaan tidak valid.');
        }

        if ($session->status !== 'in_progress') {
            abort(403, 'Sesi ujian ini sudah selesai dan tidak dapat menerima jawaban.');
        }

        if (! empty($session->is_expired)) {
            $this->examRepository->submitExamSession($sessionId);
            abort(403, 'Batas waktu ujian telah habis.');
        }

        $this->examRepository->saveMultipleStudentAnswers($sessionId, $answersList);
    }

    public function submitExamSession(string $sessionId, string $studentId)
    {
        $session = $this->examRepository->findExamSession($sessionId);
        if (! $session || $session->student_id !== $studentId) {
            abort(403, 'Sesi pengerjaan tidak valid.');
        }

        if ($session->status !== 'in_progress') {
            abort(422, 'Sesi ujian ini sudah dikumpulkan sebelumnya.');
        }

        $totalScore = $this->examRepository->submitExamSession($sessionId);

        return [
            'session_id' => $sessionId,
            'total_score' => $totalScore,
            'pass_score' => $session->pass_score,
            'is_passed' => $totalScore >= $session->pass_score,
        ];
    }

    public function getExamResultDetails(string $sessionId, string $studentId)
    {
        $result = $this->examRepository->getExamResultDetails($sessionId);

        if (! $result || $result->student_id !== $studentId) {
            abort(403, 'Anda tidak memiliki wewenang untuk melihat hasil ini.');
        }

        return $result;
    }
}
