<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Assignment>
 */
class AssignmentFactory extends Factory
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
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'due_date' => now()->addDays(7),
            'max_score' => 100,
            'allowed_file_types' => ['image', 'pdf'],
            'status' => 'published',
        ];
    }
}
