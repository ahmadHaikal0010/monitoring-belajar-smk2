<?php

namespace App\Repositories;

use App\Models\StudentProgress;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;
use Illuminate\Support\Facades\DB;

class SqlStudentProgressRepository implements StudentProgressRepositoryInterface
{
    public function getByEnrollmentAndMaterial(string $enrollmentId, string $materialId): ?StudentProgress
    {
        return StudentProgress::where('enrollment_id', $enrollmentId)
            ->where('material_id', $materialId)
            ->first();
    }

    public function updateOrCreate(array $criteria, array $data): StudentProgress
    {
        return StudentProgress::updateOrCreate($criteria, $data);
    }

    public function getByEnrollment(string $enrollmentId)
    {
        return StudentProgress::where('enrollment_id', $enrollmentId)->get();
    }

    public function getOverallStats(string $studentId): array
    {
        $enrollments = DB::table('enrollments')
            ->where('student_id', $studentId)
            ->pluck('id', 'subject_id')
            ->toArray();

        $subjectIds = array_keys($enrollments);
        $enrollmentIds = array_values($enrollments);

        $totalMaterials = DB::table('materials')
            ->whereIn('subject_id', $subjectIds)
            ->count();

        $completedMaterials = DB::table('student_progress')
            ->whereIn('enrollment_id', $enrollmentIds)
            ->where('is_completed', true)
            ->count();

        $percentage = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

        return [
            'total_enrolled_subjects' => count($subjectIds),
            'total_completed_materials' => $completedMaterials,
            'overall_progress_percentage' => $percentage,
        ];
    }

    public function getRecentActivities(string $studentId, int $limit = 5)
    {
        return DB::table('student_progress')
            ->join('enrollments', 'student_progress.enrollment_id', '=', 'enrollments.id')
            ->join('materials', 'student_progress.material_id', '=', 'materials.id')
            ->join('subjects', 'materials.subject_id', '=', 'subjects.id')
            ->where('enrollments.student_id', $studentId)
            ->where('student_progress.is_completed', true)
            ->select([
                'materials.id as material_id',
                'materials.title as material_title',
                'subjects.title as subject_title',
                'student_progress.completed_at as last_accessed'
            ])
            ->orderBy('student_progress.completed_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
