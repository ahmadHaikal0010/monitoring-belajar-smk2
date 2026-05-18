<?php

namespace App\Http\Requests\Admin\Student;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Student::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id', 'unique:students,user_id'],
            'nisn' => ['required', 'string', 'size:10', 'unique:students,nisn'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'address' => ['required', 'string'],
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
            'user_id.required' => 'Akun user harus dipilih.',
            'user_id.exists' => 'User tidak ditemukan.',
            'user_id.unique' => 'User ini sudah terdaftar sebagai siswa.',
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.size' => 'NISN harus berjumlah tepat 10 karakter.',
            'nisn.unique' => 'NISN ini sudah terdaftar di sistem kami.',
            'address.required' => 'Alamat wajib diisi.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto yang diizinkan hanya: JPG, JPEG, PNG, dan WEBP.',
            'photo.max' => 'Ukuran foto maksimal adalah 2MB.',
        ];
    }
}
