<?php

namespace App\Http\Requests\Assignment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $assignment = $this->route('assignment');

        return $this->user()->can('update', $assignment);
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'string', 'exists:subjects,id'],
            'teacher_id' => ['nullable', 'string', 'exists:teachers,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'due_date' => ['nullable', 'date'],
            'max_score' => ['required', 'integer', 'min:1', 'max:1000'],
            'allowed_file_types' => ['nullable', 'array'],
            'status' => ['required', 'in:draft,published,archived'],
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.required' => 'Mata pelajaran wajib dipilih.',
            'title.required' => 'Judul tugas wajib diisi.',
            'max_score.required' => 'Nilai maksimal wajib diisi.',
        ];
    }
}
