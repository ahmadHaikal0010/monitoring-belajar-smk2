<?php

namespace Database\Factories;

use App\Models\ExamSession;
use App\Models\Question;
use App\Models\StudentAnswer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudentAnswer>
 */
class StudentAnswerFactory extends Factory
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
            'id_sesi_ujian' => ExamSession::factory(),
            'id_soal' => Question::factory(),
            'id_opsi_dipilih' => null,
            'jawaban_esai' => null,
            'benar' => null,
            'skor_diperoleh' => 0.0,
        ];
    }
}
