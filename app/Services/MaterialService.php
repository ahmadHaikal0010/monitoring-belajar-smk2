<?php

namespace App\Services;

use App\Repositories\Interfaces\MaterialRepositoryInterface;
use Illuminate\Support\Facades\Storage;

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
            $fileName = uniqid().'.'.$file->getClientOriginalExtension();
            $folder = $data['content_type'] === 'video' ? 'materials/videos' : 'materials/documents';
            $path = $file->storeAs($folder, $fileName, 'public');
            $data['content_body'] = $path;
        } else {
            $data['content_body'] = $data['content_body_text'] ?? '';
        }

        return $this->materialRepository->create($data);
    }

    public function updateMaterial(string $id, array $data)
    {
        $oldMaterial = $this->findMaterial($id);

        if (in_array($data['content_type'], ['document', 'video']) && ! empty($data['content_body_file'])) {
            // Delete old file if exists and was a file
            if (in_array($oldMaterial->content_type, ['document', 'video']) && $oldMaterial->content_body) {
                Storage::disk('public')->delete($oldMaterial->content_body);
            }

            $file = $data['content_body_file'];
            $folder = $data['content_type'] === 'video' ? 'materials/videos' : 'materials/documents';
            $path = $file->store($folder, 'public');
            $data['content_body'] = $path;
        } else {
            // If switching from file to text, delete old file
            if (in_array($oldMaterial->content_type, ['document', 'video']) && $data['content_type'] === 'url' && $oldMaterial->content_body) {
                Storage::disk('public')->delete($oldMaterial->content_body);
            }

            // If content_type didn't change and it's a file, but no new file uploaded, keep old body
            if ($data['content_type'] === $oldMaterial->content_type && in_array($data['content_type'], ['document', 'video']) && empty($data['content_body_file'])) {
                $data['content_body'] = $oldMaterial->content_body;
            } else {
                $data['content_body'] = $data['content_body_text'] ?? '';
            }
        }

        return $this->materialRepository->update($id, $data);
    }

    public function deleteMaterial(string $id)
    {
        $material = $this->findMaterial($id);

        if (in_array($material->content_type, ['document', 'video']) && $material->content_body) {
            Storage::disk('public')->delete($material->content_body);
        }

        return $this->materialRepository->delete($id);
    }
}
