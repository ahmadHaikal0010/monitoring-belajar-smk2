<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class EnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'siswa';
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'exists:subjects,code'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kode mata pelajaran wajib diisi.',
            'code.exists' => 'Kode mata pelajaran tidak valid atau tidak ditemukan.',
        ];
    }
}
