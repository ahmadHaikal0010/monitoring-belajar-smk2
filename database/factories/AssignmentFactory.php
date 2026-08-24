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
            'id_mata_pelajaran' => Subject::factory(),
            'id_guru' => Teacher::factory(),
            'judul' => fake()->sentence(4),
            'deskripsi' => fake()->paragraph(),
            'tenggat_waktu' => now()->addDays(7),
            'skor_maksimal' => 100,
            'tipe_berkas_diizinkan' => ['image', 'pdf'],
            'status' => 'published',
        ];
    }
}
