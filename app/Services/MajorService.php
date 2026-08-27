<?php

namespace App\Services;

use App\Repositories\Interfaces\MajorRepositoryInterface;

class MajorService
{
    public function __construct(
        protected MajorRepositoryInterface $majorRepository
    ) {}

    public function getAllMajors()
    {
        return $this->majorRepository->getAll();
    }

    public function getPaginatedMajors(array $filters = [], int $perPage = 10)
    {
        return $this->majorRepository->getPaginated($filters, $perPage);
    }

    public function getMajorById(string $id)
    {
        return $this->majorRepository->find($id);
    }

    public function createMajor(array $data)
    {
        return $this->majorRepository->create($data);
    }

    public function updateMajor(string $id, array $data)
    {
        return $this->majorRepository->update($id, $data);
    }

    public function deleteMajor(string $id)
    {
        return $this->majorRepository->delete($id);
    }
}
