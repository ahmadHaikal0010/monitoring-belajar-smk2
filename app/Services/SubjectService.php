<?php

namespace App\Services;

use App\Repositories\Interfaces\SubjectRepositoryInterface;

class SubjectService
{
    protected $subjectRepository;

    public function __construct(SubjectRepositoryInterface $subjectRepository)
    {
        $this->subjectRepository = $subjectRepository;
    }

    public function createSubject(array $data)
    {
        $this->subjectRepository->create($data);
    }
}
