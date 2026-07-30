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
            'assignment_submission_id' => AssignmentSubmission::factory(),
            'file_path' => 'assignments/submissions/sample.'.$extension,
            'file_name' => fake()->word().'.'.$extension,
            'file_type' => $fileType,
            'file_size' => fake()->numberBetween(10240, 5242880),
            'mime_type' => $mime,
        ];
    }
}
