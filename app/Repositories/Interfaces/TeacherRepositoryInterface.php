<?php

namespace App\Repositories\Interfaces;

interface TeacherRepositoryInterface
{
    public function create(array $data);

    public function getByUserId(int $userId);

    public function getPaginated(array $filters = [], int $perPage = 10);

    public function getAssignableUsers(array $filter = [], int $perPage = 10);

    public function update(string $id, array $data);

    public function find(string $id);
}
