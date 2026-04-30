<?php

namespace App\Repositories\Interfaces;

interface UserRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function create(array $data);

    public function update(int $id, array $data);

    public function find(int $id);

    public function delete(int $id);
}
