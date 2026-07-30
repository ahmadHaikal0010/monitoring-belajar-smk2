<?php

namespace App\Repositories;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentSubmissionFile;
use App\Repositories\Interfaces\AssignmentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SqlAssignmentRepository implements AssignmentRepositoryInterface
{
    public function getAssignmentList(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Assignment::query()
            ->with(['subject', 'teacher.user'])
            ->withCount('submissions');

        if (! empty($filters['subject_id'])) {
            $query->where('subject_id', $filters['subject_id']);
        }

        if (! empty($filters['teacher_id'])) {
            $query->where('teacher_id', $filters['teacher_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = strtolower($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sort, $direction)->paginate($perPage)->withQueryString();
    }

    public function getAssignmentById(string $id): ?Assignment
    {
        return Assignment::with(['subject', 'teacher.user'])
            ->withCount('submissions')
            ->find($id);
    }

    public function createAssignment(array $data): Assignment
    {
        return Assignment::create($data);
    }

    public function updateAssignment(string $id, array $data): bool
    {
        $assignment = Assignment::find($id);

        if (! $assignment) {
            return false;
        }

        return $assignment->update($data);
    }

    public function deleteAssignment(string $id): bool
    {
        $assignment = Assignment::find($id);

        if (! $assignment) {
            return false;
        }

        return (bool) $assignment->delete();
    }

    public function getSubmissionsForAssignment(string $assignmentId, array $filters = []): array
    {
        $assignment = Assignment::find($assignmentId);
        if (! $assignment) {
            return [];
        }

        $submissions = AssignmentSubmission::query()
            ->with(['student.user', 'files'])
            ->where('assignment_id', $assignmentId);

        if (! empty($filters['status'])) {
            $submissions->where('status', $filters['status']);
        }

        return $submissions->orderBy('submitted_at', 'desc')->get()->toArray();
    }

    public function getSubmissionById(string $submissionId): ?AssignmentSubmission
    {
        return AssignmentSubmission::with(['assignment.subject', 'student.user', 'files'])
            ->find($submissionId);
    }

    public function saveSubmission(array $submissionData, array $files = []): AssignmentSubmission
    {
        return DB::transaction(function () use ($submissionData, $files) {
            $submission = AssignmentSubmission::updateOrCreate(
                [
                    'assignment_id' => $submissionData['assignment_id'],
                    'student_id' => $submissionData['student_id'],
                ],
                [
                    'submitted_at' => now(),
                    'notes' => $submissionData['notes'] ?? null,
                    'status' => 'submitted',
                ]
            );

            if (! empty($files)) {
                foreach ($files as $fileData) {
                    AssignmentSubmissionFile::create([
                        'assignment_submission_id' => $submission->id,
                        'file_path' => $fileData['file_path'],
                        'file_name' => $fileData['file_name'],
                        'file_type' => $fileData['file_type'],
                        'file_size' => $fileData['file_size'] ?? null,
                        'mime_type' => $fileData['mime_type'] ?? null,
                    ]);
                }
            }

            return $submission->load(['files', 'student.user']);
        });
    }

    public function gradeSubmission(string $submissionId, float $score, ?string $feedback = null): bool
    {
        $submission = AssignmentSubmission::find($submissionId);
        if (! $submission) {
            return false;
        }

        return $submission->update([
            'score' => $score,
            'feedback' => $feedback,
            'status' => 'graded',
        ]);
    }

    public function getStudentAssignmentsForSubject(string $subjectId, string $studentId): array
    {
        $assignments = Assignment::where('subject_id', $subjectId)
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->get();

        return $assignments->map(function ($assignment) use ($studentId) {
            $submission = AssignmentSubmission::with('files')
                ->where('assignment_id', $assignment->id)
                ->where('student_id', $studentId)
                ->first();

            return [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'due_date' => $assignment->due_date?->toIso8601String(),
                'max_score' => $assignment->max_score,
                'allowed_file_types' => $assignment->allowed_file_types,
                'submission' => $submission ? [
                    'id' => $submission->id,
                    'submitted_at' => $submission->submitted_at->toIso8601String(),
                    'notes' => $submission->notes,
                    'score' => $submission->score,
                    'feedback' => $submission->feedback,
                    'status' => $submission->status,
                    'files' => $submission->files->map(fn ($f) => [
                        'id' => $f->id,
                        'file_path' => asset('storage/'.$f->file_path),
                        'file_name' => $f->file_name,
                        'file_type' => $f->file_type,
                    ]),
                ] : null,
            ];
        })->toArray();
    }
}
