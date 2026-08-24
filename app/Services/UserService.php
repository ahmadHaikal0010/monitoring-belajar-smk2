<?php

namespace App\Services;

use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

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

    public function approveUser(int $id)
    {
        $this->userRepository->approve($id);
    }

    public function authenticate(string $identity, string $password)
    {
        $user = $this->userRepository->authenticate($identity);

        if (! $user || ! Hash::check($password, $user->kata_sandi)) {
            abort(401, 'NISN / Nomor Induk atau kata sandi yang Anda masukkan tidak sesuai.');
        }

        if (! $user->is_approved) {
            abort(403, 'Akun Anda saat ini masih dalam proses peninjauan oleh administrator sekolah.');
        }

        if ($user->role !== 'siswa') {
            abort(403, 'Maaf, akses aplikasi mobile saat ini hanya dikhususkan bagi akun siswa.');
        }

        return $user;
    }

    public function siswaRegister(array $data)
    {
        $this->userRepository->register($data);
    }
}
