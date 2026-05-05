<?php

namespace Database\Factories;

use App\Models\Material;
use App\Models\Subject;
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
        $type = fake()->randomElement(['video', 'document', 'url']);

        $body = match ($type) {
            'video' => 'https://www.youtube.com/embed/'.fake()->bothify('??##??##??'),
            'url' => fake()->url(),
            'document' => 'materials/files/'.fake()->uuid().'.pdf',
        };

        return [
            'id' => fake()->uuid(),
            'subject_id' => Subject::factory(),
            'title' => fake()->sentence(4),
            'content_type' => $type,
            'content_body' => $body,
            'description' => fake()->optional()->paragraph(),
        ];
    }
}
