<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(protected UserRepositoryInterface $userRepository) {}

    /**
     * Validate and create a newly registered user (Siswa).
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'nisn' => ['required', 'string', 'digits:10', 'unique:siswa,nisn'],
            'alamat' => ['required', 'string', 'max:500'],
            'password' => $this->passwordRules(),
        ], [
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.digits' => 'NISN harus berjumlah 10 digit angka.',
            'nisn.unique' => 'NISN ini telah terdaftar dalam sistem.',
            'alamat.required' => 'Alamat tempat tinggal wajib diisi.',
        ])->validate();

        return $this->userRepository->register([
            'name' => $input['name'],
            'nisn' => $input['nisn'],
            'email' => $input['email'],
            'alamat' => $input['alamat'] ?? $input['address'] ?? '',
            'password' => $input['password'],
        ]);
    }
}
