<?php

namespace App\Http\Requests\Material;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMaterialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $material = $this->route('material');

        // Ensure we have a model instance for the policy check
        // If it's a string, we might need to fetch it, but usually with Route Model Binding it's an object
        return $this->user()->can('update', $material);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $type = $this->input('content_type');

        return [
            'title' => ['required', 'string', 'max:255'],
            'content_type' => ['required', 'string', 'in:video,document,url'],
            'content_body_text' => ['required_if:content_type,url', 'nullable', 'string', 'max:2000'],
            'content_body_file' => [
                'nullable', // Optional for update
                'file',
                $type === 'video' ? 'mimes:mp4,mov,avi,webm' : 'mimes:pdf',
                $type === 'video' ? 'max:51200' : 'max:10240',
            ],
            'description' => ['nullable', 'string', 'max:1000'],
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
            'title.required' => 'Judul materi wajib diisi.',
            'title.max' => 'Judul materi tidak boleh lebih dari 255 karakter.',
            'content_type.required' => 'Jenis konten wajib dipilih.',
            'content_type.in' => 'Jenis konten yang dipilih tidak valid.',
            'content_body_text.required_if' => 'Tautan atau kode embed wajib diisi.',
            'content_body_file.file' => 'Input harus berupa file.',
            'content_body_file.mimes' => 'Format file tidak sesuai dengan jenis konten yang dipilih.',
            'content_body_file.max' => 'Ukuran file melebihi batas yang diizinkan.',
            'description.max' => 'Deskripsi tidak boleh lebih dari 1000 karakter.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'Judul Materi',
            'content_type' => 'Jenis Konten',
            'content_body_text' => 'Tautan/Embed',
            'content_body_file' => 'File Materi',
            'description' => 'Deskripsi Materi',
        ];
    }
}
