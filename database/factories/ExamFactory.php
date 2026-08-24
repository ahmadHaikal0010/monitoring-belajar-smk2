<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exam>
 */
class ExamFactory extends Factory
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
            'judul' => fake()->sentence(3),
            'deskripsi' => fake()->optional()->paragraph(),
            'durasi' => fake()->randomElement([30, 60, 90, 120]),
            'nilai_kkm' => 75,
            'acak_soal' => fake()->boolean(),
            'acak_opsi' => fake()->boolean(),
            'status' => 'published',
            'waktu_mulai' => now(),
            'waktu_selesai' => now()->addDays(7),
        ];
    }
}
