<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AssignmentControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_dapat_melihat_halaman_tugas()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('teacher.assignments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Assignments/index')
        );
    }

    public function test_admin_ditolak_mengakses_halaman_tugas()
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_approved' => true]);

        $response = $this->actingAs($admin)->get(route('teacher.assignments.index'));

        $response->assertStatus(403);
    }

    public function test_guru_dapat_membuat_tugas_baru()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($user)->post(route('teacher.assignments.store'), [
            'subject_id' => $subject->id,
            'title' => 'Tugas Laporan Praktikum',
            'description' => 'Unggah dokumen PDF atau foto.',
            'due_date' => now()->addDays(7)->toDateTimeString(),
            'max_score' => 100,
            'allowed_file_types' => ['image', 'pdf'],
            'status' => 'published',
        ]);

        $response->assertRedirect(route('teacher.assignments.index'));
        $this->assertDatabaseHas('assignments', [
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'title' => 'Tugas Laporan Praktikum',
            'max_score' => 100,
        ]);
    }

    public function test_guru_dapat_memberi_nilai_manual_tugas_siswa()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);
        $assignment = Assignment::factory()->create(['subject_id' => $subject->id, 'teacher_id' => $teacher->id]);

        $studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $student = Student::factory()->create(['user_id' => $studentUser->id]);

        $submission = AssignmentSubmission::factory()->create([
            'assignment_id' => $assignment->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($user)->post(
            route('teacher.assignments.submissions.grade', [$assignment->id, $submission->id]),
            [
                'score' => 95,
                'feedback' => 'Pekerjaan sangat rapi dan lengkap.',
            ]
        );

        $response->assertRedirect(route('teacher.assignments.show', $assignment->id));
        $this->assertDatabaseHas('assignment_submissions', [
            'id' => $submission->id,
            'score' => 95,
            'feedback' => 'Pekerjaan sangat rapi dan lengkap.',
            'status' => 'graded',
        ]);
    }
}
