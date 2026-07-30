<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && in_array(auth()->user()->role, ['admin', 'guru']);
    }

    public function rules(): array
    {
        return [
            'question_text' => ['required', 'string'],
            'material_id' => ['nullable', 'string', 'exists:materials,id'],
            'question_type' => ['required', 'in:multiple_choice,essay'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
            'score' => ['required', 'numeric', 'min:0.1', 'max:100'],
            'options' => ['required_if:question_type,multiple_choice', 'array', 'min:2'],
            'options.*.option_text' => ['required_if:question_type,multiple_choice', 'string'],
            'options.*.is_correct' => ['nullable', 'boolean'],
        ];
    }
}
