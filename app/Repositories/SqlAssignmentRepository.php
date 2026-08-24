<?php

namespace App\Repositories;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentSubmissionFile;
use App\Repositories\Interfaces\AssignmentRepositoryInterface;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SqlAssignmentRepository implements AssignmentRepositoryInterface
{
    public function getAssignmentList(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Assignment::query()
            ->with(['subject', 'teacher.user'])
            ->withCount('submissions');

        if (! empty($filters['subject_id'])) {
            $query->where('id_mata_pelajaran', $filters['subject_id']);
        }

        if (! empty($filters['teacher_id'])) {
            $query->where('id_guru', $filters['teacher_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
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
            ->where('id_tugas', $assignmentId);

        if (! empty($filters['status'])) {
            $submissions->where('status', $filters['status']);
        }

        return $submissions->orderBy('dikumpulkan_pada', 'desc')->get()->toArray();
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
                    'id_tugas' => $submissionData['assignment_id'] ?? $submissionData['id_tugas'],
                    'id_siswa' => $submissionData['student_id'] ?? $submissionData['id_siswa'],
                ],
                [
                    'dikumpulkan_pada' => now(),
                    'catatan' => $submissionData['notes'] ?? $submissionData['catatan'] ?? null,
                    'status' => 'submitted',
                ]
            );

            if (! empty($files)) {
                foreach ($files as $fileData) {
                    AssignmentSubmissionFile::create([
                        'id_pengumpulan_tugas' => $submission->id,
                        'jalur_berkas' => $fileData['file_path'],
                        'nama_berkas' => $fileData['file_name'],
                        'tipe_berkas' => $fileData['file_type'],
                        'ukuran_berkas' => $fileData['file_size'] ?? null,
                        'tipe_mime' => $fileData['mime_type'] ?? null,
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
            'skor' => $score,
            'umpan_balik' => $feedback,
            'status' => 'graded',
        ]);
    }

    public function getStudentAssignmentsForSubject(string $subjectId, string $studentId): array
    {
        $assignments = Assignment::where('id_mata_pelajaran', $subjectId)
            ->where('status', 'published')
            ->orderBy('created_at', 'asc')
            ->get();

        return $assignments->map(function ($assignment) use ($studentId) {
            $submission = AssignmentSubmission::with('files')
                ->where('id_tugas', $assignment->id)
                ->where('id_siswa', $studentId)
                ->first();

            $dueDate = $assignment->due_date;
            $dueDateIso = null;
            if ($dueDate) {
                $dueDateIso = $dueDate instanceof CarbonInterface ? $dueDate->toIso8601String() : Carbon::parse($dueDate)->toIso8601String();
            }

            $submissionData = null;
            if ($submission) {
                $submittedAt = $submission->submitted_at;
                $submittedAtIso = null;
                if ($submittedAt) {
                    $submittedAtIso = $submittedAt instanceof CarbonInterface ? $submittedAt->toIso8601String() : Carbon::parse($submittedAt)->toIso8601String();
                }

                $submissionData = [
                    'id' => $submission->id,
                    'submitted_at' => $submittedAtIso,
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
                ];
            }

            return [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'due_date' => $dueDateIso,
                'max_score' => $assignment->max_score,
                'allowed_file_types' => $assignment->allowed_file_types,
                'submission' => $submissionData,
            ];
        })->toArray();
    }
}
