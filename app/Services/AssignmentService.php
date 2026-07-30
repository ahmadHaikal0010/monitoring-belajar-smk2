<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Repositories\Interfaces\AssignmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;

class AssignmentService
{
    public function __construct(
        protected AssignmentRepositoryInterface $assignmentRepository
    ) {}

    public function getAssignmentList(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return $this->assignmentRepository->getAssignmentList($filters, $perPage);
    }

    public function getAssignmentById(string $id): ?Assignment
    {
        return $this->assignmentRepository->getAssignmentById($id);
    }

    public function createAssignment(array $data): Assignment
    {
        if (empty($data['allowed_file_types'])) {
            $data['allowed_file_types'] = ['image', 'pdf'];
        }

        return $this->assignmentRepository->createAssignment($data);
    }

    public function updateAssignment(string $id, array $data): bool
    {
        return $this->assignmentRepository->updateAssignment($id, $data);
    }

    public function deleteAssignment(string $id): bool
    {
        return $this->assignmentRepository->deleteAssignment($id);
    }

    public function getSubmissionsForAssignment(string $assignmentId, array $filters = []): array
    {
        return $this->assignmentRepository->getSubmissionsForAssignment($assignmentId, $filters);
    }

    public function getSubmissionById(string $submissionId): ?AssignmentSubmission
    {
        return $this->assignmentRepository->getSubmissionById($submissionId);
    }

    /**
     * Manual grading by teacher.
     */
    public function gradeSubmission(string $submissionId, float $score, ?string $feedback = null): bool
    {
        return $this->assignmentRepository->gradeSubmission($submissionId, $score, $feedback);
    }

    /**
     * Student submitting assignment files (bulk photos or PDF file).
     */
    public function submitAssignment(string $assignmentId, string $studentId, ?string $notes = null, array $uploadedFiles = []): AssignmentSubmission
    {
        $savedFiles = [];

        foreach ($uploadedFiles as $file) {
            if (! ($file instanceof UploadedFile)) {
                continue;
            }

            $mime = $file->getMimeType();
            $fileType = str_starts_with($mime, 'image/') ? 'image' : 'pdf';
            $path = $file->store('assignments/submissions', 'public');

            $savedFiles[] = [
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $fileType,
                'file_size' => $file->getSize(),
                'mime_type' => $mime,
            ];
        }

        return $this->assignmentRepository->saveSubmission([
            'assignment_id' => $assignmentId,
            'student_id' => $studentId,
            'notes' => $notes,
        ], $savedFiles);
    }

    public function getStudentAssignmentsForSubject(string $subjectId, string $studentId): array
    {
        return $this->assignmentRepository->getStudentAssignmentsForSubject($subjectId, $studentId);
    }
}
