<?php

namespace App\Http\Requests\Admin\Student;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $student = $this->route('student');
        return $this->user()->can('update', $student);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $student = $this->route('student');

        return [
            'nisn' => [
                'required',
                'string',
                'size:10',
                Rule::unique('students', 'nisn')->ignore($student->id),
            ],
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
