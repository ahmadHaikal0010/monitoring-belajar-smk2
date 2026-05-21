<?php

namespace App\Repositories;

use App\Models\StudentProgress;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;

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
}
