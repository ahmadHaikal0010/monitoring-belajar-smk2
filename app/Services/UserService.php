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
}
