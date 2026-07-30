<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssignmentSubmission>
 */
class AssignmentSubmissionFactory extends Factory
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
            'assignment_id' => Assignment::factory(),
            'student_id' => Student::factory(),
            'submitted_at' => now(),
            'notes' => fake()->optional()->sentence(),
            'score' => fake()->optional()->randomFloat(1, 60, 100),
            'feedback' => fake()->optional()->sentence(),
            'status' => 'submitted',
        ];
    }
}
