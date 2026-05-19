<?php

namespace Tests\Feature\Console;

use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResetSemesterCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_command_deletes_all_subjects_materials_and_enrollments()
    {
        // Setup data
        $subject = Subject::factory()->create();
        Material::factory()->count(2)->create(['subject_id' => $subject->id]);
        Enrollment::factory()->count(2)->create(['subject_id' => $subject->id]);

        // Setup fake files
        Storage::disk('public')->put('materials/documents/test.pdf', 'content');
        Storage::disk('public')->put('materials/videos/test.mp4', 'content');

        // Run command with --force
        $this->artisan('app:reset-semester --force')
            ->assertExitCode(0);

        // Assert database is empty for these tables
        $this->assertDatabaseCount('subjects', 0);
        $this->assertDatabaseCount('materials', 0);
        $this->assertDatabaseCount('enrollments', 0);

        // Assert files are deleted
        Storage::disk('public')->assertMissing('materials/documents/test.pdf');
        Storage::disk('public')->assertMissing('materials/videos/test.mp4');
    }

    public function test_command_requires_confirmation_without_force_flag()
    {
        Subject::factory()->create();

        $this->artisan('app:reset-semester')
            ->expectsConfirmation('Apakah Anda yakin ingin menghapus SELURUH data mata pelajaran, materi, dan pendaftaran? Tindakan ini tidak dapat dibatalkan.', 'no')
            ->expectsOutput('Proses reset semester dibatalkan.')
            ->assertExitCode(0);

        $this->assertDatabaseCount('subjects', 1);
    }
}
