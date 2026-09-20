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
            'subject_id' => ['required', 'uuid', 'exists:mata_pelajaran,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.required' => 'ID mata pelajaran wajib diisi.',
            'subject_id.uuid' => 'ID mata pelajaran harus berupa UUID yang valid.',
            'subject_id.exists' => 'Mata pelajaran tidak ditemukan.',
        ];
    }
}
