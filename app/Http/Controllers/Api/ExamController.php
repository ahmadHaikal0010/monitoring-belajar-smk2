<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use App\Services\ExamService;
use App\Services\StudentService;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    public function __construct(
        protected ExamService $examService,
        protected EnrollmentService $enrollmentService,
        protected StudentService $studentService
    ) {}

    /**
     * Get published exams for an enrolled subject.
     */
    public function index(Request $request, string $subjectId)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student || ! $this->enrollmentService->checkEnrollment($student->id, $subjectId)) {
            abort(403, 'Anda belum terdaftar pada mata pelajaran ini.');
        }

        $exams = $this->examService->getPublishedExamsBySubject($subjectId);

        // Attach student's session status to each exam if available
        foreach ($exams as $exam) {
            $session = $this->examService->findExamWithDetails($exam->id);
            $studentSession = collect($session->sessions ?? [])->firstWhere('student_id', $student->id);
            $exam->student_session = $studentSession;
        }

        return response()->json([
            'success' => true,
            'data' => $exams,
        ]);
    }

    /**
     * Start or resume an exam session.
     */
    public function start(Request $request, string $examId)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(403, 'Profil siswa tidak ditemukan.');
        }

        $examData = $this->examService->findExam($examId);
        if (! $examData || ! $this->enrollmentService->checkEnrollment($student->id, $examData->subject_id)) {
            abort(403, 'Anda tidak terdaftar pada mata pelajaran ujian ini.');
        }

        $payload = $this->examService->startOrResumeExamSession($examId, $student->id);

        return response()->json([
            'success' => true,
            'message' => 'Sesi ujian berhasil dimulai.',
            'data' => $payload,
        ]);
    }

    /**
     * Save a student's answer in real-time during an active exam session.
     */
    public function submitAnswer(Request $request, string $sessionId)
    {
        $request->validate([
            'question_id' => ['required', 'string'],
            'selected_option_id' => ['nullable', 'string'],
            'essay_answer' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(403, 'Profil siswa tidak ditemukan.');
        }

        $this->examService->saveStudentAnswer(
            $sessionId,
            $student->id,
            $request->input('question_id'),
            $request->input('selected_option_id'),
            $request->input('essay_answer')
        );

        return response()->json([
            'success' => true,
            'message' => 'Jawaban berhasil disimpan.',
        ]);
    }

    /**
     * Get active session state including remaining time and saved answers.
     */
    public function showSession(Request $request, string $sessionId)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(403, 'Profil siswa tidak ditemukan.');
        }

        $payload = $this->examService->getExamSessionState($sessionId, $student->id);

        return response()->json([
            'success' => true,
            'data' => $payload,
        ]);
    }

    /**
     * Save multiple answers at once in real-time.
     */
    public function submitMultipleAnswers(Request $request, string $sessionId)
    {
        $request->validate([
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'string'],
            'answers.*.selected_option_id' => ['nullable', 'string'],
            'answers.*.essay_answer' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(403, 'Profil siswa tidak ditemukan.');
        }

        $this->examService->saveMultipleStudentAnswers(
            $sessionId,
            $student->id,
            $request->input('answers')
        );

        return response()->json([
            'success' => true,
            'message' => 'Semua jawaban berhasil tersimpan.',
        ]);
    }

    /**
     * Submit/finish the exam session.
     */
    public function submitSession(Request $request, string $sessionId)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(403, 'Profil siswa tidak ditemukan.');
        }

        $summary = $this->examService->submitExamSession($sessionId, $student->id);

        return response()->json([
            'success' => true,
            'message' => 'Ujian berhasil dikumpulkan.',
            'data' => $summary,
        ]);
    }

    /**
     * Get detailed result of a completed exam session.
     */
    public function result(Request $request, string $sessionId)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(403, 'Profil siswa tidak ditemukan.');
        }

        $result = $this->examService->getExamResultDetails($sessionId, $student->id);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
