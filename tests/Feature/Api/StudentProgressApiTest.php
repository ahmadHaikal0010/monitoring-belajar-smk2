<?php

namespace Tests\Feature\Api;

use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentProgressApiTest extends TestCase
{
    use RefreshDatabase;

    protected $studentUser;

    protected $student;

    protected $subject;

    protected $materials;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a teacher
        $teacherUser = User::factory()->create(['role' => 'guru']);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);

        // Create a subject
        $this->subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        // Create materials
        $this->materials = Material::factory()->count(3)->create(['subject_id' => $this->subject->id]);

        // Create a student
        $this->studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);

        // Enroll student to subject
        Enrollment::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'status' => 'enrolled',
            'enrolled_at' => now(),
        ]);
    }

    public function test_student_can_mark_material_as_completed()
    {
        $material = $this->materials->first();

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/materials/{$material->id}/complete");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'material_id' => $material->id,
                    'is_completed' => true,
                ],
            ]);

        $this->assertDatabaseHas('student_progress', [
            'material_id' => $material->id,
            'is_completed' => true,
        ]);
    }

    public function test_student_can_get_subject_progress()
    {
        // Mark one material as completed
        $material = $this->materials->first();
        $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/materials/{$material->id}/complete");

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/subjects/{$this->subject->id}/progress");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_materials' => 3,
                    'completed_materials' => 1,
                    'percentage' => 33,
                    'completed_material_ids' => [$material->id],
                ],
            ]);
    }

    public function test_student_cannot_mark_material_of_not_enrolled_subject()
    {
        // Create another subject and material
        $otherSubject = Subject::factory()->create();
        $otherMaterial = Material::factory()->create(['subject_id' => $otherSubject->id]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->postJson("/api/materials/{$otherMaterial->id}/complete");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Student is not enrolled in this subject',
            ]);
    }
}
