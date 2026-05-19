<?php

namespace Tests\Feature\Admin;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EnrollmentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $teacherUser;

    protected Teacher $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin', 'is_approved' => true]);

        $this->teacherUser = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $this->teacher = Teacher::factory()->create(['user_id' => $this->teacherUser->id]);
    }

    public function test_admin_can_see_all_subjects_in_enrollment_index()
    {
        Subject::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.enrollments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Enrollments/index')
            ->where('mode', 'subjects')
            ->has('subjects.data', 5)
        );
    }

    public function test_guru_only_sees_their_subjects_in_enrollment_index()
    {
        // Their subject
        Subject::factory()->create(['teacher_id' => $this->teacher->id]);

        // Other subject
        Subject::factory()->create();

        $response = $this->actingAs($this->teacherUser)->get(route('admin.enrollments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Enrollments/index')
            ->where('mode', 'subjects')
            ->has('subjects.data', 1)
        );
    }

    public function test_admin_can_view_enrollments_for_a_subject()
    {
        $subject = Subject::factory()->create();
        $student = Student::factory()->create();

        Enrollment::factory()->create([
            'subject_id' => $subject->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.enrollments.index', ['subject_id' => $subject->id]));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Enrollments/index')
            ->where('mode', 'enrollments')
            ->has('enrollments.data', 1)
            ->where('enrollments.data.0.student_name', $student->user->name)
        );
    }

    public function test_guru_can_delete_enrollment_from_their_subject()
    {
        $subject = Subject::factory()->create(['teacher_id' => $this->teacher->id]);
        $enrollment = Enrollment::factory()->create(['subject_id' => $subject->id]);

        $response = $this->actingAs($this->teacherUser)->delete(route('admin.enrollments.destroy', $enrollment->id));

        $response->assertRedirect();
        $this->assertDatabaseMissing('enrollments', ['id' => $enrollment->id]);
    }

    public function test_guru_cannot_delete_enrollment_from_other_teacher_subject()
    {
        $otherSubject = Subject::factory()->create();
        $enrollment = Enrollment::factory()->create(['subject_id' => $otherSubject->id]);

        $response = $this->actingAs($this->teacherUser)->delete(route('admin.enrollments.destroy', $enrollment->id));

        $response->assertStatus(403);
        $this->assertDatabaseHas('enrollments', ['id' => $enrollment->id]);
    }
}
