<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssignmentSubmission>
 */
class AssignmentSubmissionFactory extends Factory
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
            'id_tugas' => Assignment::factory(),
            'id_siswa' => Student::factory(),
            'dikumpulkan_pada' => now(),
            'catatan' => fake()->optional()->sentence(),
            'skor' => fake()->optional()->randomFloat(1, 60, 100),
            'umpan_balik' => fake()->optional()->sentence(),
            'status' => 'submitted',
        ];
    }
}
