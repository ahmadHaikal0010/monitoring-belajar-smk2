<?php

namespace Database\Factories;

use App\Models\Material;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Material>
 */
class MaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject_id' => Subject::factory(),
            'teacher_id' => Teacher::factory(),
            'title' => fake()->sentence(),
            'type' => fake()->randomElement(['video', 'document', 'url']),
            'content_path' => fake()->optional()->url(),
            'description' => fake()->optional()->paragraph(),
        ];
    }
}
