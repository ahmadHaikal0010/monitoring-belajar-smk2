<?php

namespace App\Repositories\Interfaces;

interface TeacherRepositoryInterface
{
    public function create(array $data);

    public function getByUserId($userId);
}
