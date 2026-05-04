<?php

namespace App\Services;

use App\Repositories\Interfaces\SubjectRepositoryInterface;

class SubjectService
{
    protected SubjectRepositoryInterface $subjectRepository;

    public function __construct(SubjectRepositoryInterface $subjectRepository)
    {
        $this->subjectRepository = $subjectRepository;
    }

    public function createSubject(array $data)
    {
        $this->subjectRepository->create($data);
    }

    public function getSubjectList(array $filters = [], int $perPage = 10)
    {
        return $this->subjectRepository->getPaginated($filters, $perPage);
    }

    public function getSubjectById(string $id)
    {
        return $this->subjectRepository->find($id);
    }
}
