<?php

namespace App\Repositories\Interfaces;

interface MajorRepositoryInterface
{
    public function getAll();

    public function getPaginated(array $filters = [], int $perPage = 10);

    public function find(string $id);

    public function findByCode(string $code);

    public function create(array $data);

    public function update(string $id, array $data);

    public function delete(string $id);
}
