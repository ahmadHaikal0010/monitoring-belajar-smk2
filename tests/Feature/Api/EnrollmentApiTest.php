<?php

namespace Tests\Feature\Api;

use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        \Illuminate\Support\Facades\DB::table('enrollments')->insert([
            'id' => \Illuminate\Support\Str::uuid(),
            'student_id' => $this->student->id,
            'subject_id' => $subject->id,
            'status' => 'enrolled',
            'enrolled_at' => now(),
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')->getJson('/api/subjects');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', $subject->title);
    }

    public function test_student_can_enroll_using_valid_code()
    {
        $subject = Subject::factory()->create(['code' => 'TEST12']);

        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', [
            'code' => 'TEST12'
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        
        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->student->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_student_cannot_enroll_twice_to_same_subject()
    {
        $subject = Subject::factory()->create(['code' => 'DUPL01']);
        
        // First enrollment
        $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', ['code' => 'DUPL01']);

        // Second enrollment attempt
        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', ['code' => 'DUPL01']);

        $response->assertStatus(422);
        $response->assertJsonFragment(['message' => 'Anda sudah terdaftar di mata pelajaran ini.']);
    }

    public function test_student_cannot_enroll_with_invalid_code()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')->postJson('/api/enroll', [
            'code' => 'INVALID'
        ]);

        $response->assertStatus(422); // Validation error from EnrollmentRequest
    }
}
