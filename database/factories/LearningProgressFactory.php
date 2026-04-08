<?php

namespace Database\Factories;

use App\Models\LearningProgress;
use App\Models\Material;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearningProgress>
 */
class LearningProgressFactory extends Factory
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
            'material_id' => Material::factory(),
            'status' => fake()->randomElement(['not_started', 'in_progress', 'completed']),
            'last_accessed_at' => fake()->dateTimeBetween('-1 month', 'now'),
            'completion_percentage' => fake()->numberBetween(0, 100),
        ];
    }
}
