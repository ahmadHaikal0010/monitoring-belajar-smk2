<?php

namespace App\Repositories\Interfaces;

interface ExamRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function find(string $id);

    public function findWithQuestionsAndOptions(string $id);

    public function create(array $data);

    public function update(string $id, array $data);

    public function delete(string $id);

    public function addQuestion(string $examId, array $questionData, array $optionsData = []);

    public function updateQuestion(string $questionId, array $questionData, array $optionsData = []);

    public function deleteQuestion(string $questionId);

    public function getExamSessions(string $examId);

    public function getPublishedExamsBySubject(string $subjectId);

    public function getStudentExamSession(string $examId, string $studentId);

    public function createExamSession(string $examId, string $studentId);

    public function findExamSession(string $sessionId);

    public function getExamQuestionsForStudent(string $examId, bool $randomizeQuestions = false, bool $randomizeOptions = false);

    public function getSavedStudentAnswers(string $sessionId);

    public function saveStudentAnswer(string $sessionId, string $questionId, ?string $selectedOptionId = null, ?string $essayAnswer = null);

    public function saveMultipleStudentAnswers(string $sessionId, array $answersList);

    public function submitExamSession(string $sessionId);

    public function getExamResultDetails(string $sessionId);
}
