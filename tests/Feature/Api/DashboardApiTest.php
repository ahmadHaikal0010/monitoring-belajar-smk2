<?php

namespace Tests\Feature\Api;

use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Student;
use App\Models\StudentProgress;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
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
        $teacherUser = User::factory()->create(['role' => 'guru', 'name' => 'Budi, S.Pd']);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);

        // Create a subject
        $this->subject = Subject::factory()->create([
            'teacher_id' => $teacher->id,
            'title' => 'Matematika',
        ]);

        // Create 5 materials
        $this->materials = Material::factory()->count(5)->create(['subject_id' => $this->subject->id]);

        // Create a student
        $this->studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true, 'name' => 'Ahmad Haikal']);
        $this->student = Student::factory()->create(['user_id' => $this->studentUser->id]);

        // Enroll student to subject
        $enrollment = Enrollment::create([
            'student_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'status' => 'enrolled',
            'enrolled_at' => now(),
        ]);

        // Complete 4 materials
        foreach ($this->materials->take(4) as $material) {
            StudentProgress::create([
                'enrollment_id' => $enrollment->id,
                'material_id' => $material->id,
                'is_completed' => true,
                'completed_at' => now(),
            ]);
        }
    }

    public function test_can_get_dashboard_summary()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/dashboard/summary');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_enrolled_subjects' => 1,
                    'total_completed_materials' => 4,
                    'overall_progress_percentage' => 80,
                    'student_name' => 'Ahmad Haikal',
                ],
            ]);
    }

    public function test_can_get_enrolled_subjects_with_progress()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/dashboard/enrolled-subjects');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    [
                        'title' => 'Matematika',
                        'teacher_name' => 'Budi, S.Pd',
                        'progress' => [
                            'percentage' => 80,
                            'completed' => 4,
                            'total' => 5,
                        ],
                    ],
                ],
            ]);
    }

    public function test_can_get_recent_activities()
    {
        $response = $this->actingAs($this->studentUser, 'sanctum')
            ->getJson('/api/dashboard/recent-activities');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(4, 'data');
    }
}
