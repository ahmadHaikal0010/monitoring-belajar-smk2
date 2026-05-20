<?php

namespace Tests\Feature\Api;

use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MaterialApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $studentUser;

    protected Student $student;

    protected Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);
        $this->subject = Subject::factory()->create();

        Storage::fake('public');
    }

    public function test_student_can_list_materials_for_enrolled_subject()
    {
        // Enroll student
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
        ]);

        Material::factory()->count(3)->create([
            'subject_id' => $this->subject->id,
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/subjects/{$this->subject->id}/materials");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data.data');
    }

    public function test_student_cannot_list_materials_for_not_enrolled_subject()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/subjects/{$this->subject->id}/materials");

        $response->assertStatus(403);
    }

    public function test_student_can_see_material_detail()
    {
        Enrollment::factory()->create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
        ]);

        $material = Material::factory()->create([
            'subject_id' => $this->subject->id,
            'content_type' => 'document',
            'content_body' => 'materials/test.pdf',
        ]);

        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson("/api/materials/{$material->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.title', $material->title);
        $response->assertJsonPath('data.content_body_url', Storage::disk('public')->url($material->content_body));
    }
}
