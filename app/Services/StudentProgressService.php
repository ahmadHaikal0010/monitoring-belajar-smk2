<?php

namespace App\Services;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\MaterialRepositoryInterface;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class StudentProgressService
{
    public function __construct(
        protected StudentProgressRepositoryInterface $progressRepository,
        protected EnrollmentRepositoryInterface $enrollmentRepository,
        protected MaterialRepositoryInterface $materialRepository
    ) {}

    /**
     * Mark a material as completed for a student.
     */
    public function markAsCompleted(string $studentId, string $materialId): array
    {
        $material = $this->materialRepository->find($materialId);
        if (! $material) {
            return ['success' => false, 'message' => 'Material not found'];
        }

        // Check if student is enrolled in the subject of this material
        $enrollment = $this->enrollmentRepository->getByStudentAndSubject($studentId, $material->subject_id);
        if (! $enrollment) {
            return ['success' => false, 'message' => 'Student is not enrolled in this subject'];
        }

        $progress = $this->progressRepository->updateOrCreate(
            [
                'enrollment_id' => $enrollment->id,
                'material_id' => $materialId,
            ],
            [
                'is_completed' => true,
                'completed_at' => Date::now(),
            ]
        );

        return ['success' => true, 'data' => $progress];
    }

    /**
     * Get progress for a student in a specific subject.
     */
    public function getSubjectProgress(string $studentId, string $subjectId): array
    {
        $enrollment = $this->enrollmentRepository->getByStudentAndSubject($studentId, $subjectId);
        if (! $enrollment) {
            return ['success' => false, 'message' => 'Student is not enrolled in this subject'];
        }

        $materials = $this->materialRepository->getBySubjectId($subjectId);
        $progress = $this->progressRepository->getByEnrollment($enrollment->id);

        $completedMaterialIds = $progress->where('is_completed', true)->pluck('material_id')->toArray();

        $totalMaterials = count($materials);
        $completedMaterials = count($completedMaterialIds);
        $percentage = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

        $examResults = DB::table('exams')
            ->leftJoin('exam_sessions', function ($join) use ($studentId) {
                $join->on('exams.id', '=', 'exam_sessions.exam_id')
                    ->where('exam_sessions.student_id', '=', $studentId);
            })
            ->where('exams.subject_id', $subjectId)
            ->where('exams.status', 'published')
            ->select([
                'exams.id as exam_id',
                'exams.title as exam_title',
                'exams.pass_score',
                'exams.duration',
                'exam_sessions.id as session_id',
                'exam_sessions.status as session_status',
                'exam_sessions.total_score',
                'exam_sessions.submitted_at',
            ])
            ->orderBy('exams.created_at', 'asc')
            ->get()
            ->map(function ($item) {
                $item->is_passed = $item->total_score !== null ? ((float) $item->total_score >= (float) $item->pass_score) : null;

                return $item;
            });

        return [
            'success' => true,
            'data' => [
                'total_materials' => $totalMaterials,
                'completed_materials' => $completedMaterials,
                'percentage' => $percentage,
                'completed_material_ids' => $completedMaterialIds,
                'exam_results' => $examResults,
            ],
        ];
    }
}
