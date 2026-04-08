<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\StudentActivity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentActivity>
 */
class StudentActivityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'activity_type' => fake()->randomElement(['watch_video', 'view_material']),
        ];
    }
}
