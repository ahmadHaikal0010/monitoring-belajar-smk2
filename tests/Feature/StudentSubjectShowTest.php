<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Exam;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\TestCase;

class StudentSubjectShowTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_subject_page_contains_assignment_and_exam_data(): void
    {
        $studentUser = User::factory()->create([
            'role' => 'siswa',
            'is_approved' => true,
        ]);

        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
        ]);

        $subject = Subject::factory()->create();

        DB::table('pendaftaran')->insert([
            'id' => Str::uuid(),
            'id_siswa' => $student->id,
            'id_mata_pelajaran' => $subject->id,
            'status' => 'enrolled',
            'terdaftar_pada' => now(),
        ]);

        $assignment = Assignment::factory()->create([
            'id_mata_pelajaran' => $subject->id,
            'status' => 'published',
        ]);

        $exam = Exam::factory()->create([
            'id_mata_pelajaran' => $subject->id,
            'status' => 'published',
        ]);

        $response = $this->actingAs($studentUser, 'web')->get(route('student.subjects.show', $subject->id));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Subjects/show')
            ->has('assignments', 1)
            ->has('exams', 1)
            ->where('assignments.0.id', $assignment->id)
            ->where('exams.0.id', $exam->id)
        );
    }
}
