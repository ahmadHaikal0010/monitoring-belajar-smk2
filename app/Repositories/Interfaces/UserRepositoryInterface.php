<?php

namespace App\Repositories\Interfaces;

interface UserRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);
}
