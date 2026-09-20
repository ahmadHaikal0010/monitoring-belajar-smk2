<?php

namespace Tests\Feature\Api;

use App\Models\Classroom;
use App\Models\Major;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class EnrollmentApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $studentUser;

    protected Student $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
    }

    public function test_student_can_view_their_subjects()
    {
        $subject = Subject::factory()->create();

        // Manual insert since we don't have enrollment factory fully tested yet or want to isolate
        DB::table('pendaftaran')->insert([
            'id' => Str::uuid(),
            'id_siswa' => $this->student->id,
            'id_mata_pelajaran' => $subject->id,
            'status' => 'enrolled',
            'terdaftar_pada' => now(),
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')->getJson('/api/subjects');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', $subject->title);
    }

    public function test_student_can_view_available_subjects()
    {
        // Create major manually since factory might be missing
        $majorId = (string) Str::uuid();
        DB::table('jurusan')->insert([
            'id' => $majorId,
            'kode_jurusan' => 'TKL',
            'nama_jurusan' => 'Teknik Ketenagalistrikan',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create classroom manually
        $classroomId = (string) Str::uuid();
        DB::table('kelas')->insert([
            'id' => $classroomId,
            'id_jurusan' => $majorId,
            'tingkat' => '10',
            'rombel' => '1',
            'nama_kelas' => '10 TKL 1',
            'tahun_ajaran' => '2023/2024',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->student->update(['id_kelas' => $classroomId]);

        $subject = Subject::factory()->create();
        DB::table('kelas_mata_pelajaran')->insert([
            'id' => Str::uuid(),
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classroomId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')->getJson('/api/subjects/available');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonCount(1, 'data');
    }

    public function test_student_can_enroll_to_subject()
    {
        $subject = Subject::factory()->create();

        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', [
            'subject_id' => $subject->id,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseHas('pendaftaran', [
            'id_siswa' => $this->student->id,
            'id_mata_pelajaran' => $subject->id,
        ]);
    }

    public function test_student_cannot_enroll_twice_to_same_subject()
    {
        $subject = Subject::factory()->create();

        // First enrollment
        $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', ['subject_id' => $subject->id]);

        // Second enrollment attempt
        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', ['subject_id' => $subject->id]);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Anda sudah terdaftar di mata pelajaran ini.']);
    }

    public function test_student_cannot_enroll_to_non_existent_subject()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', [
            'subject_id' => Str::uuid(),
        ]);

        $response->assertStatus(422);
    }

    public function test_student_can_unenroll_from_subject()
    {
        $subject = Subject::factory()->create();

        // Enroll first
        DB::table('pendaftaran')->insert([
            'id' => Str::uuid(),
            'id_siswa' => $this->student->id,
            'id_mata_pelajaran' => $subject->id,
            'status' => 'enrolled',
            'terdaftar_pada' => now(),
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->deleteJson("/api/subjects/{$subject->id}/unenroll");

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);

        $this->assertDatabaseMissing('pendaftaran', [
            'id_siswa' => $this->student->id,
            'id_mata_pelajaran' => $subject->id,
        ]);
    }
}
