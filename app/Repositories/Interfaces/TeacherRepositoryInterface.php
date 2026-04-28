<?php

namespace App\Repositories\Interfaces;

interface TeacherRepositoryInterface
{
    public function create(array $data);

    public function getByUserId($userId);

    public function getPaginated(array $filters = [], $perPage = 10);

    public function update($id, array $data);
}
