<?php

namespace App\Http\Requests\Admin\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $teacherId = $this->route('teacher');

        return [
            'nip' => ['required', 'string', 'size:18', 'unique:teachers,nip,'.$teacherId],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'bio' => ['nullable', 'string', 'max:255'],
            'specialization' => ['required', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nip.required' => 'Nomor Induk Pegawai (NIP) wajib diisi.',
            'nip.size' => 'Nomor Induk Pegawai (NIP) harus berjumlah 18 karakter.',
            'nip.unique' => 'Nomor Induk Pegawai (NIP) ini sudah terdaftar di sistem.',
            'specialization.required' => 'Bidang spesialisasi wajib diisi.',
            'bio.string' => 'Bio harus berupa format teks.',
            'photo.image' => 'File yang diunggah harus berupa gambar.',
            'photo.mimes' => 'Format foto yang diizinkan adalah JPG, JPEG, PNG, atau WEBP.',
            'photo.max' => 'Ukuran foto maksimal adalah 2MB.',
        ];
    }
}
