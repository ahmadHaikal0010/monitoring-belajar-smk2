<?php

namespace App\Repositories\Interfaces;

interface StudentRepositoryInterface
{
    public function find(string $id);

    public function findByUserId(int $userId);

    public function update(string $id, array $data);
}
