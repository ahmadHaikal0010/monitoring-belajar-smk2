<?php

namespace Database\Factories;

use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subject>
 */
class SubjectFactory extends Factory
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
            'teacher_id' => Teacher::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
        ];
    }
}
