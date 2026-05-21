<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StudentProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentProgressController extends Controller
{
    public function __construct(
        protected StudentProgressService $progressService
    ) {}

    /**
     * Mark a material as completed.
     */
    public function markAsCompleted(Request $request, string $materialId): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a student',
            ], 403);
        }

        $result = $this->progressService->markAsCompleted($student->id, $materialId);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }

    /**
     * Get progress for a specific subject.
     */
    public function getSubjectProgress(Request $request, string $subjectId): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a student',
            ], 403);
        }

        $result = $this->progressService->getSubjectProgress($student->id, $subjectId);

        if (! $result['success']) {
            return response()->json($result, 400);
        }

        return response()->json($result);
    }
}
