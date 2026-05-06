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

    public function findMaterial(string $id)
    {
        return $this->materialRepository->find($id);
    }

    public function createMaterial(array $data)
    {
        if (in_array($data['content_type'], ['document', 'video']) && ! empty($data['content_body_file'])) {
            $file = $data['content_body_file'];
            $folder = $data['content_type'] === 'video' ? 'materials/videos' : 'materials/documents';
            $path = $file->store($folder, 'public');
            $data['content_body'] = $path;
        } else {
            $data['content_body'] = $data['content_body_text'] ?? '';
        }

        return $this->materialRepository->create($data);
    }
}
