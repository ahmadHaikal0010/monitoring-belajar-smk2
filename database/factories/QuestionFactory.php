<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
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
            'id_ujian' => Exam::factory(),
            'teks_soal' => fake()->sentence(8).'?',
            'tipe_soal' => 'multiple_choice',
            'jalur_gambar' => null,
            'bobot_skor' => 1.0,
            'urutan' => fake()->numberBetween(1, 20),
        ];
    }
}
