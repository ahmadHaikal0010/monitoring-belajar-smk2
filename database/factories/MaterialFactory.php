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
            'id_mata_pelajaran' => Subject::factory(),
            'judul' => fake()->sentence(4),
            'tipe_konten' => $type,
            'isi_konten' => $body,
            'deskripsi' => fake()->optional()->paragraph(),
        ];
    }
}
