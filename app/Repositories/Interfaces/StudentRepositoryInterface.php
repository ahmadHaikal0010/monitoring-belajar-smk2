<?php

namespace App\Repositories\Interfaces;

interface StudentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function getAssignableUsers(array $filters = [], int $perPage = 10);

    public function find(string $id);

    public function findByUserId(int $userId);

    public function create(array $data);

    public function update(string $id, array $data);

    public function delete(string $id);
}
