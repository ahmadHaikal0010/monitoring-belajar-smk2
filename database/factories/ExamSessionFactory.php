<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExamSession>
 */
class ExamSessionFactory extends Factory
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
            'id_siswa' => Student::factory(),
            'dimulai_pada' => now(),
            'dikumpulkan_pada' => null,
            'total_skor' => null,
            'status' => 'in_progress',
        ];
    }
}
