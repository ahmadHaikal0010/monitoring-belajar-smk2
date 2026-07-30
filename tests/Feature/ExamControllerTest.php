<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExamControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_dapat_melihat_halaman_ujian()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($user)->get(route('teacher.exams.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Exams/index')
            ->where('mode', 'subjects')
        );
    }

    public function test_guru_dapat_membuat_ujian_baru()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($user)->post(route('teacher.exams.store'), [
            'subject_id' => $subject->id,
            'title' => 'Ujian Akhir Semester',
            'description' => 'Kerjakan dengan teliti.',
            'duration' => 90,
            'pass_score' => 75,
            'randomize_questions' => true,
            'randomize_options' => true,
            'status' => 'published',
        ]);

        $response->assertRedirect(route('teacher.exams.index', ['subject_id' => $subject->id]));
        $this->assertDatabaseHas('exams', [
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'title' => 'Ujian Akhir Semester',
            'duration' => 90,
        ]);
    }

    public function test_guru_dapat_menambah_soal_ke_ujian()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);
        $exam = Exam::factory()->create(['subject_id' => $subject->id, 'teacher_id' => $teacher->id]);

        $response = $this->actingAs($user)->post(route('teacher.exams.questions.store', $exam->id), [
            'question_text' => 'Berapa 5 x 5?',
            'question_type' => 'multiple_choice',
            'score' => 5.0,
            'options' => [
                ['option_text' => '25', 'is_correct' => true],
                ['option_text' => '20', 'is_correct' => false],
                ['option_text' => '30', 'is_correct' => false],
                ['option_text' => '15', 'is_correct' => false],
            ],
        ]);

        $response->assertRedirect(route('teacher.exams.show', $exam->id));
        $this->assertDatabaseHas('questions', [
            'exam_id' => $exam->id,
            'question_text' => 'Berapa 5 x 5?',
            'score' => 5.0,
        ]);
        $this->assertDatabaseHas('options', [
            'option_text' => '25',
            'is_correct' => true,
        ]);
    }

    public function test_guru_dapat_menghapus_soal()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $user->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);
        $exam = Exam::factory()->create(['subject_id' => $subject->id, 'teacher_id' => $teacher->id]);
        $question = Question::factory()->create(['exam_id' => $exam->id]);

        $response = $this->actingAs($user)->delete(route('teacher.exams.questions.destroy', [$exam->id, $question->id]));

        $response->assertRedirect(route('teacher.exams.show', $exam->id));
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }
}
