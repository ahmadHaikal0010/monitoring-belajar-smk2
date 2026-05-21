<?php

namespace App\Repositories\Interfaces;

use App\Models\StudentProgress;

interface StudentProgressRepositoryInterface
{
    /**
     * Get progress for a specific enrollment and material.
     */
    public function getByEnrollmentAndMaterial(string $enrollmentId, string $materialId): ?StudentProgress;

    /**
     * Update or create progress.
     */
    public function updateOrCreate(array $criteria, array $data): StudentProgress;

    /**
     * Get progress for an enrollment.
     */
    public function getByEnrollment(string $enrollmentId);
}
