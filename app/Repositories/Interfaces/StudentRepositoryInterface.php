<?php

namespace App\Repositories\Interfaces;

interface StudentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10);

    public function getAssignableUsers(array $filters = [], int $perPage = 10);

    public function find(string $id);

    public function findByUserId(string|int $userId);

    public function create(array $data);

    public function update(string $id, array $data);

    public function delete(string $id);

    public function findClassByName(string $className): ?object;

    public function isEmailExists(string $email): bool;

    public function isNisnExists(string $nisn): bool;

    public function createStudentWithUser(array $userData, array $studentData, ?string $classId): void;
}
