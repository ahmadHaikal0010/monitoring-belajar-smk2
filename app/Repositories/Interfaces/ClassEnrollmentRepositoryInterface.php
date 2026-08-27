<?php

namespace App\Repositories\Interfaces;

interface ClassEnrollmentRepositoryInterface
{
    public function getStudentsInClassroom(string $classroomId, array $filters = [], int $perPage = 15);

    public function getUnassignedStudents(array $filters = [], int $perPage = 15);

    public function assignStudentsToClassroom(string $classroomId, array $studentIds);

    public function removeStudentFromClassroom(string $classroomId, string $studentId);

    public function updateEnrollmentStatus(string $classroomId, string $studentId, string $status);
}
