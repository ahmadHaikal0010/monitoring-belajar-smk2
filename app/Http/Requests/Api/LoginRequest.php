<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nisn' => 'nullable|string',
            'email' => 'nullable|string',
            'identity' => 'nullable|string',
            'password' => 'required|string',
            'device_name' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'password.required' => 'Kata sandi wajib diisi.',
            'device_name.required' => 'Informasi perangkat (device name) diperlukan.',
        ];
    }
}
