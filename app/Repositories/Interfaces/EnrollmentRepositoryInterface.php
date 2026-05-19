<?php

namespace App\Repositories\Interfaces;

interface EnrollmentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function find(string $id);

    public function enroll(string $studentId, string $subjectId);

    public function isEnrolled(string $studentId, string $subjectId): bool;

    public function getStudentEnrollments(string $studentId);

    public function delete(string $id);
}
