<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Services\AssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignmentApiController extends Controller
{
    public function __construct(
        protected AssignmentService $assignmentService
    ) {}

    /**
     * Get published assignments for a subject with student submission status.
     */
    public function getSubjectAssignments(Request $request, string $subjectId): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Profil siswa tidak ditemukan.',
            ], 404);
        }

        $assignments = $this->assignmentService->getStudentAssignmentsForSubject($subjectId, $student->id);

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    /**
     * Get single assignment detail and submission status.
     */
    public function getAssignmentDetail(Request $request, string $assignmentId): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        $assignment = $this->assignmentService->getAssignmentById($assignmentId);

        if (! $assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan.',
            ], 404);
        }

        $submission = null;
        if ($student) {
            $sub = AssignmentSubmission::with('files')
                ->where('assignment_id', $assignmentId)
                ->where('student_id', $student->id)
                ->first();

            if ($sub) {
                $submission = [
                    'id' => $sub->id,
                    'submitted_at' => $sub->submitted_at->toIso8601String(),
                    'notes' => $sub->notes,
                    'score' => $sub->score,
                    'feedback' => $sub->feedback,
                    'status' => $sub->status,
                    'files' => $sub->files->map(fn ($f) => [
                        'id' => $f->id,
                        'file_path' => asset('storage/'.$f->file_path),
                        'file_name' => $f->file_name,
                        'file_type' => $f->file_type,
                    ]),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $assignment->id,
                'subject_id' => $assignment->subject_id,
                'subject_title' => $assignment->subject?->title,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'due_date' => $assignment->due_date?->toIso8601String(),
                'max_score' => $assignment->max_score,
                'allowed_file_types' => $assignment->allowed_file_types,
                'submission' => $submission,
            ],
        ]);
    }

    /**
     * Student submit assignment (bulk photos & PDF files).
     */
    public function submitAssignment(Request $request, string $assignmentId): JsonResponse
    {
        $user = $request->user();
        $student = Student::where('user_id', $user->id)->first();

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'Profil siswa tidak ditemukan.',
            ], 404);
        }

        $assignment = $this->assignmentService->getAssignmentById($assignmentId);
        if (! $assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan.',
            ], 404);
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['file', 'mimes:jpeg,png,jpg,pdf', 'max:10240'], // max 10MB per file
        ], [
            'files.required' => 'Wajib mengunggah minimal 1 berkas foto atau PDF.',
            'files.*.mimes' => 'Format file hanya diperbolehkan Foto (JPG, PNG) atau PDF.',
            'files.*.max' => 'Ukuran maksimal berkas adalah 10MB per file.',
        ]);

        $files = $request->file('files', []);

        $submission = $this->assignmentService->submitAssignment(
            $assignmentId,
            $student->id,
            $request->input('notes'),
            $files
        );

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dikumpulkan.',
            'data' => [
                'submission_id' => $submission->id,
                'status' => $submission->status,
                'file_count' => count($submission->files),
            ],
        ]);
    }
}
