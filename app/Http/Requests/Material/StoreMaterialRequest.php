<?php

namespace App\Http\Requests\Material;

use App\Models\Material;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', Material::class);
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
            'subject_id' => ['required', 'exists:subjects,id'],
            'title' => ['required', 'string', 'max:255'],
            'content_type' => ['required', 'string', 'in:video,document,url'],
            'content_body_text' => ['required_if:content_type,url', 'nullable', 'string', 'max:2000'],
            'content_body_file' => [
                'required_if:content_type,video,document',
                'nullable',
                'file',
                $type === 'video' ? 'mimes:mp4,mov,avi,webm' : 'mimes:pdf,doc,docx,ppt,pptx',
                $type === 'video' ? 'max:51200' : 'max:10240', // 50MB for video, 10MB for doc
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
            'subject_id.required' => 'Mata pelajaran wajib dipilih.',
            'subject_id.exists' => 'Mata pelajaran tidak ditemukan.',
            'title.required' => 'Judul materi wajib diisi.',
            'title.max' => 'Judul materi tidak boleh lebih dari 255 karakter.',
            'content_type.required' => 'Jenis konten wajib dipilih.',
            'content_type.in' => 'Jenis konten yang dipilih tidak valid.',
            'content_body_text.required_if' => 'Tautan atau kode embed wajib diisi.',
            'content_body_file.required_if' => 'File materi wajib diunggah.',
            'content_body_file.file' => 'Input harus berupa file.',
            'content_body_file.uploaded' => 'Gagal mengunggah file. Ukuran file mungkin melebihi batas maksimal server ('.ini_get('upload_max_filesize').').',
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
            'subject_id' => 'Mata Pelajaran',
            'title' => 'Judul Materi',
            'content_type' => 'Jenis Konten',
            'content_body_text' => 'Tautan/Embed',
            'content_body_file' => 'File Materi',
            'description' => 'Deskripsi Materi',
        ];
    }
}
