<?php

namespace App\Http\Requests\Admin\Teacher;

use App\Models\Teacher;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        /** @var Teacher $teacher */
        $teacher = $this->route('teacher');

        return [
            'nip' => [
                'required',
                'string',
                'size:18',
                Rule::unique('teachers', 'nip')->ignore($teacher->id),
            ],
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
            'nip.size' => 'Nomor Induk Pegawai (NIP) harus berjumlah tepat 18 karakter.',
            'nip.unique' => 'NIP ini sudah terdaftar di sistem kami.',
            'specialization.required' => 'Bidang keahlian atau spesialisasi wajib diisi.',
            'bio.string' => 'Bio harus berupa teks.',
            'photo.image' => 'File harus berupa gambar.',
            'photo.mimes' => 'Format foto yang diizinkan hanya: JPG, JPEG, PNG, dan WEBP.',
            'photo.max' => 'Ukuran foto maksimal adalah 2MB.',
        ];
    }
}
