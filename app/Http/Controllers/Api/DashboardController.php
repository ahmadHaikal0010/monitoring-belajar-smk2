<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected StudentProgressRepositoryInterface $progressRepository,
        protected EnrollmentRepositoryInterface $enrollmentRepository
    ) {}

    /**
     * Get dashboard summary for student.
     */
    public function summary(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a student',
            ], 403);
        }

        $stats = $this->progressRepository->getOverallStats($student->id);
        $stats['student_name'] = $request->user()->name;

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get enrolled subjects with progress details.
     */
    public function enrolledSubjects(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a student',
            ], 403);
        }

        $subjects = $this->enrollmentRepository->getStudentEnrollmentsWithProgress($student->id);

        $formattedSubjects = collect($subjects)->map(function ($subject) {
            $total = (int) $subject->total_materials;
            $completed = (int) $subject->completed_materials;
            $percentage = $total > 0 ? round(($completed / $total) * 100) : 0;

            return [
                'id' => $subject->id,
                'title' => $subject->title,
                'teacher_name' => $subject->teacher_name,
                'progress' => [
                    'percentage' => $percentage,
                    'completed' => $completed,
                    'total' => $total,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedSubjects,
        ]);
    }

    /**
     * Get recent study activities.
     */
    public function recentActivities(Request $request): JsonResponse
    {
        $student = $request->user()->student;

        if (! $student) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a student',
            ], 403);
        }

        $activities = $this->progressRepository->getRecentActivities($student->id);

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }
}
