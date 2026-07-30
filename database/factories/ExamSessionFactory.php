<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExamSession>
 */
class ExamSessionFactory extends Factory
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
            'student_id' => Student::factory(),
            'started_at' => now(),
            'submitted_at' => null,
            'total_score' => null,
            'status' => 'in_progress',
        ];
    }
}
