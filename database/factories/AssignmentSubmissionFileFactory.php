<?php

namespace Database\Factories;

use App\Models\AssignmentSubmission;
use App\Models\AssignmentSubmissionFile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AssignmentSubmissionFile>
 */
class AssignmentSubmissionFileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $fileType = fake()->randomElement(['image', 'pdf']);
        $extension = $fileType === 'image' ? 'jpg' : 'pdf';
        $mime = $fileType === 'image' ? 'image/jpeg' : 'application/pdf';

        return [
            'id' => fake()->uuid(),
            'id_pengumpulan_tugas' => AssignmentSubmission::factory(),
            'jalur_berkas' => 'assignments/submissions/sample.'.$extension,
            'nama_berkas' => fake()->word().'.'.$extension,
            'tipe_berkas' => $fileType,
            'ukuran_berkas' => fake()->numberBetween(10240, 5242880),
            'tipe_mime' => $mime,
        ];
    }
}
