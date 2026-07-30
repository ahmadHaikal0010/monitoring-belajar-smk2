<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Option;
use App\Models\Question;
use App\Models\Student;
use App\Models\StudentAnswer;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_exam_with_questions_and_options()
    {
        $teacher = Teacher::factory()->create();
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        $exam = Exam::factory()->create([
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'title' => 'Ujian Algoritma',
        ]);

        $question = Question::factory()->create([
            'exam_id' => $exam->id,
            'question_text' => 'Apa output dari echo 1+1?',
            'question_type' => 'multiple_choice',
            'image_path' => 'exams/questions/q1.png',
        ]);

        $option1 = Option::factory()->create([
            'question_id' => $question->id,
            'option_text' => '2',
            'is_correct' => true,
        ]);

        $option2 = Option::factory()->create([
            'question_id' => $question->id,
            'option_text' => '11',
            'is_correct' => false,
        ]);

        $this->assertDatabaseHas('exams', ['id' => $exam->id, 'title' => 'Ujian Algoritma']);
        $this->assertDatabaseHas('questions', ['id' => $question->id, 'image_path' => 'exams/questions/q1.png']);
        $this->assertDatabaseHas('options', ['id' => $option1->id, 'is_correct' => true]);

        $this->assertCount(1, $exam->questions);
        $this->assertCount(2, $question->options);
        $this->assertEquals($teacher->id, $exam->teacher->id);
        $this->assertEquals($subject->id, $exam->subject->id);
    }

    public function test_can_create_exam_session_and_student_answers()
    {
        $student = Student::factory()->create();
        $exam = Exam::factory()->create();

        $question = Question::factory()->create(['exam_id' => $exam->id]);
        $option = Option::factory()->create(['question_id' => $question->id, 'is_correct' => true]);

        $session = ExamSession::factory()->create([
            'exam_id' => $exam->id,
            'student_id' => $student->id,
            'status' => 'in_progress',
        ]);

        $answer = StudentAnswer::factory()->create([
            'exam_session_id' => $session->id,
            'question_id' => $question->id,
            'selected_option_id' => $option->id,
            'is_correct' => true,
            'score_earned' => 1.0,
        ]);

        $this->assertDatabaseHas('exam_sessions', ['id' => $session->id, 'status' => 'in_progress']);
        $this->assertDatabaseHas('student_answers', ['id' => $answer->id, 'score_earned' => 1.0]);

        $this->assertCount(1, $session->studentAnswers);
        $this->assertEquals($student->id, $session->student->id);
        $this->assertEquals($exam->id, $session->exam->id);
    }

    public function test_deleting_exam_cascades_to_questions_and_sessions()
    {
        $exam = Exam::factory()->create();
        $question = Question::factory()->create(['exam_id' => $exam->id]);
        $option = Option::factory()->create(['question_id' => $question->id]);
        $session = ExamSession::factory()->create(['exam_id' => $exam->id]);
        $answer = StudentAnswer::factory()->create([
            'exam_session_id' => $session->id,
            'question_id' => $question->id,
            'selected_option_id' => $option->id,
        ]);

        $exam->delete();

        $this->assertDatabaseMissing('exams', ['id' => $exam->id]);
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
        $this->assertDatabaseMissing('options', ['id' => $option->id]);
        $this->assertDatabaseMissing('exam_sessions', ['id' => $session->id]);
        $this->assertDatabaseMissing('student_answers', ['id' => $answer->id]);
    }
}
