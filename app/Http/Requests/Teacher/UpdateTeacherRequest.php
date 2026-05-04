<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $teacher = $this->route('teacher');

        return $this->user()->can('update', $teacher);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
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
            'specialization.required' => 'Bidang keahlian atau spesialisasi wajib diisi.',
            'bio.string' => 'Bio harus berupa teks.',
            'bio.max' => 'Bio tidak boleh lebih dari 255 karakter.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto yang diizinkan hanya: JPG, JPEG, PNG, dan WEBP.',
            'photo.max' => 'Ukuran foto maksimal adalah 2MB.',
        ];
    }
}
