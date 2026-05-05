<?php

namespace App\Services;

use App\Repositories\Interfaces\MaterialRepositoryInterface;

class MaterialService
{
    protected MaterialRepositoryInterface $materialRepository;

    public function __construct(MaterialRepositoryInterface $materialRepository)
    {
        $this->materialRepository = $materialRepository;
    }

    public function getPaginatedMaterials(array $filters = [], int $perPage = 10)
    {
        return $this->materialRepository->getPaginated($filters, $perPage);
    }
}
