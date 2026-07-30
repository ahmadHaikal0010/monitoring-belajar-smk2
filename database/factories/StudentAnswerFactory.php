<?php

namespace Database\Factories;

use App\Models\ExamSession;
use App\Models\Question;
use App\Models\StudentAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentAnswer>
 */
class StudentAnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->uuid(),
            'exam_session_id' => ExamSession::factory(),
            'question_id' => Question::factory(),
            'selected_option_id' => null,
            'essay_answer' => null,
            'is_correct' => null,
            'score_earned' => 0.0,
        ];
    }
}
