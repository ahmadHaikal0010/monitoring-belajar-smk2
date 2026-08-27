<?php

namespace App\Services;

use App\Repositories\Interfaces\ClassroomRepositoryInterface;

class ClassroomService
{
    public function __construct(
        protected ClassroomRepositoryInterface $classroomRepository
    ) {}

    public function getAllClassrooms()
    {
        return $this->classroomRepository->getAll();
    }

    public function getPaginatedClassrooms(array $filters = [], int $perPage = 10)
    {
        return $this->classroomRepository->getPaginated($filters, $perPage);
    }

    public function getClassroomById(string $id)
    {
        return $this->classroomRepository->find($id);
    }

    public function createClassroom(array $data)
    {
        return $this->classroomRepository->create($data);
    }

    public function updateClassroom(string $id, array $data)
    {
        return $this->classroomRepository->update($id, $data);
    }

    public function deleteClassroom(string $id)
    {
        return $this->classroomRepository->delete($id);
    }

    public function getAvailableHomeroomTeachers(?string $currentTeacherId = null)
    {
        return $this->classroomRepository->getAvailableHomeroomTeachers($currentTeacherId);
    }
}
