<?php

namespace App\Services;

use App\Repositories\Interfaces\UserRepositoryInterface;

class UserService
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function getUserList(array $filters = [], int $perPage = 10)
    {
        return $this->userRepository->getPaginated($filters, $perPage);
    }

    public function createUser(array $data)
    {
        $this->userRepository->create($data);
    }

    public function updateUser(int $id, array $data)
    {
        $this->userRepository->update($id, $data);
    }

    public function findUser(int $id)
    {
        return $this->userRepository->find($id);
    }

    public function deleteUser(int $id)
    {
        $this->userRepository->delete($id);
    }
}
