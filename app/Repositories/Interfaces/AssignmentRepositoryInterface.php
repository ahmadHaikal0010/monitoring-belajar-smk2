<?php

namespace App\Repositories\Interfaces;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AssignmentRepositoryInterface
{
    public function getAssignmentList(array $filters = [], int $perPage = 12): LengthAwarePaginator;

    public function getAssignmentById(string $id): ?Assignment;

    public function createAssignment(array $data): Assignment;

    public function updateAssignment(string $id, array $data): bool;

    public function deleteAssignment(string $id): bool;

    public function getSubmissionsForAssignment(string $assignmentId, array $filters = []): array;

    public function getSubmissionById(string $submissionId): ?AssignmentSubmission;

    public function saveSubmission(array $submissionData, array $files = []): AssignmentSubmission;

    public function gradeSubmission(string $submissionId, float $score, ?string $feedback = null): bool;

    public function getStudentAssignmentsForSubject(string $subjectId, string $studentId): array;
}
