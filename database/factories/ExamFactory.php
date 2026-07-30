<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
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
            'subject_id' => Subject::factory(),
            'teacher_id' => Teacher::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'duration' => fake()->randomElement([30, 60, 90, 120]),
            'pass_score' => 75,
            'randomize_questions' => fake()->boolean(),
            'randomize_options' => fake()->boolean(),
            'status' => 'published',
            'start_time' => now(),
            'end_time' => now()->addDays(7),
        ];
    }
}
