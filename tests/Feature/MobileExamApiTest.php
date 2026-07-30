<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Exam;
use App\Models\Option;
use App\Models\Question;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MobileExamApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_siswa_dapat_mengambil_daftar_ujian_mapel_terdaftar()
    {
        $studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $student = Student::factory()->create(['user_id' => $studentUser->id]);

        $teacher = Teacher::factory()->create();
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        Enrollment::factory()->create(['student_id' => $student->id, 'subject_id' => $subject->id, 'status' => 'enrolled']);

        $exam = Exam::factory()->create(['subject_id' => $subject->id, 'teacher_id' => $teacher->id, 'status' => 'published']);

        $response = $this->actingAs($studentUser, 'sanctum')
            ->getJson("/api/subjects/{$subject->id}/exams");

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment(['id' => $exam->id, 'title' => $exam->title]);
    }

    public function test_siswa_dapat_memulai_dan_mengumpulkan_ujian()
    {
        $studentUser = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $student = Student::factory()->create(['user_id' => $studentUser->id]);

        $teacher = Teacher::factory()->create();
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        Enrollment::factory()->create(['student_id' => $student->id, 'subject_id' => $subject->id, 'status' => 'enrolled']);

        $exam = Exam::factory()->create([
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'status' => 'published',
            'pass_score' => 70,
        ]);

        $question = Question::factory()->create(['exam_id' => $exam->id, 'score' => 100]);
        $optionCorrect = Option::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        $optionWrong = Option::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        // 1. Mulai Ujian
        $startResponse = $this->actingAs($studentUser, 'sanctum')
            ->postJson("/api/exams/{$exam->id}/start");

        $startResponse->assertStatus(200);
        $sessionId = $startResponse->json('data.session.id');

        // 2. Simpan Jawaban Real-time (Per Soal)
        $answerResponse = $this->actingAs($studentUser, 'sanctum')
            ->postJson("/api/exams/sessions/{$sessionId}/answer", [
                'question_id' => $question->id,
                'selected_option_id' => $optionCorrect->id,
            ]);

        $answerResponse->assertStatus(200);
        $this->assertDatabaseHas('student_answers', [
            'exam_session_id' => $sessionId,
            'question_id' => $question->id,
            'is_correct' => true,
            'score_earned' => 100,
        ]);

        // 2b. Test Resume Ujian (Memastikan jawaban tersimpan dikembalikan saat masuk ulang)
        $resumeResponse = $this->actingAs($studentUser, 'sanctum')
            ->postJson("/api/exams/{$exam->id}/start");

        $resumeResponse->assertStatus(200);
        $resumeResponse->assertJsonPath("data.saved_answers.{$question->id}.selected_option_id", $optionCorrect->id);
        $resumeResponse->assertJsonPath('data.saved_answers_list.0.question_id', $question->id);

        // 2c. Test Fetch State Sesi Aktif
        $sessionStateResponse = $this->actingAs($studentUser, 'sanctum')
            ->getJson("/api/exams/sessions/{$sessionId}");

        $sessionStateResponse->assertStatus(200);
        $sessionStateResponse->assertJsonPath("data.saved_answers.{$question->id}.selected_option_id", $optionCorrect->id);

        // 3. Kumpul Ujian
        $submitResponse = $this->actingAs($studentUser, 'sanctum')
            ->postJson("/api/exams/sessions/{$sessionId}/submit");

        $submitResponse->assertStatus(200);
        $submitResponse->assertJsonFragment([
            'total_score' => 100,
            'is_passed' => true,
        ]);

        // 4. Lihat Hasil Detail
        $resultResponse = $this->actingAs($studentUser, 'sanctum')
            ->getJson("/api/exams/sessions/{$sessionId}/result");

        $resultResponse->assertStatus(200);
        $resultResponse->assertJsonFragment([
            'exam_title' => $exam->title,
            'total_score' => 100,
        ]);
    }
}
