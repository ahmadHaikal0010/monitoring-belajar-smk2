<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
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
            'exam_id' => Exam::factory(),
            'question_text' => fake()->sentence(8).'?',
            'question_type' => 'multiple_choice',
            'image_path' => null,
            'score' => 1.0,
            'order' => fake()->numberBetween(1, 20),
        ];
    }
}
