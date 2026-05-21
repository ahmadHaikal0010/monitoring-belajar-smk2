<?php

namespace App\Repositories\Interfaces;

interface EnrollmentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function find(string $id);

    public function findWithProgress(string $id);

    public function getPaginatedWithProgress(array $filters = [], int $perPage = 10);

    public function enroll(string $studentId, string $subjectId);

    public function isEnrolled(string $studentId, string $subjectId): bool;

    public function getByStudentAndSubject(string $studentId, string $subjectId);

    public function getStudentEnrollments(string $studentId);

    public function getStudentEnrollmentsWithProgress(string $studentId);

    public function delete(string $id);
}
