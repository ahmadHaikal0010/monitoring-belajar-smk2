<?php

namespace App\Services;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\MaterialRepositoryInterface;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;
use Illuminate\Support\Facades\Date;

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
        if (!$material) {
            return ['success' => false, 'message' => 'Material not found'];
        }

        // Check if student is enrolled in the subject of this material
        $enrollment = $this->enrollmentRepository->getByStudentAndSubject($studentId, $material->subject_id);
        if (!$enrollment) {
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
        if (!$enrollment) {
            return ['success' => false, 'message' => 'Student is not enrolled in this subject'];
        }

        $materials = $this->materialRepository->getBySubjectId($subjectId);
        $progress = $this->progressRepository->getByEnrollment($enrollment->id);

        $completedMaterialIds = $progress->where('is_completed', true)->pluck('material_id')->toArray();
        
        $totalMaterials = count($materials);
        $completedMaterials = count($completedMaterialIds);
        $percentage = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

        return [
            'success' => true,
            'data' => [
                'total_materials' => $totalMaterials,
                'completed_materials' => $completedMaterials,
                'percentage' => $percentage,
                'completed_material_ids' => $completedMaterialIds,
            ]
        ];
    }
}
