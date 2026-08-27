<?php

namespace App\Services;

use App\Repositories\Interfaces\ClassEnrollmentRepositoryInterface;

class ClassEnrollmentService
{
    public function __construct(
        protected ClassEnrollmentRepositoryInterface $classEnrollmentRepository
    ) {}

    public function getStudentsInClassroom(string $classroomId, array $filters = [], int $perPage = 15)
    {
        return $this->classEnrollmentRepository->getStudentsInClassroom($classroomId, $filters, $perPage);
    }

    public function getUnassignedStudents(array $filters = [], int $perPage = 15)
    {
        return $this->classEnrollmentRepository->getUnassignedStudents($filters, $perPage);
    }

    public function assignStudentsToClassroom(string $classroomId, array $studentIds)
    {
        return $this->classEnrollmentRepository->assignStudentsToClassroom($classroomId, $studentIds);
    }

    public function removeStudentFromClassroom(string $classroomId, string $studentId)
    {
        return $this->classEnrollmentRepository->removeStudentFromClassroom($classroomId, $studentId);
    }

    public function updateEnrollmentStatus(string $classroomId, string $studentId, string $status)
    {
        return $this->classEnrollmentRepository->updateEnrollmentStatus($classroomId, $studentId, $status);
    }
}
