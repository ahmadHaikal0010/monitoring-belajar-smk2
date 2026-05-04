<?php

namespace App\Repositories\Interfaces;

interface SubjectRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function create(array $data);

    public function find(string $id);

    public function update(string $id, array $data);

    public function delete(string $id);
}
