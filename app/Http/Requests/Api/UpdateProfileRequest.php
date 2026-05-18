<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();
        $student = $user->student;

        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'nisn' => [
                'nullable',
                'string',
                'size:10',
                Rule::unique('students')->ignore($student->id ?? null),
            ],
            'address' => 'nullable|string',
            'photo' => 'nullable|image|max:2048', // Max 2MB
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email sudah digunakan.',
            'nisn.unique' => 'NISN sudah terdaftar.',
            'nisn.size' => 'NISN harus 10 karakter.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
