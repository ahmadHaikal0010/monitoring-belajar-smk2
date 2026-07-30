<?php

namespace App\Repositories;

use App\Repositories\Interfaces\ExamRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SqlExamRepository implements ExamRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('exams')
            ->join('subjects', 'exams.subject_id', '=', 'subjects.id')
            ->join('teachers', 'exams.teacher_id', '=', 'teachers.id')
            ->select([
                'exams.id',
                'exams.subject_id',
                'exams.teacher_id',
                'exams.title',
                'exams.description',
                'exams.duration',
                'exams.pass_score',
                'exams.randomize_questions',
                'exams.randomize_options',
                'exams.status',
                'exams.start_time',
                'exams.end_time',
                'exams.created_at',
                'subjects.title as subject_title',
                'teachers.id as teacher_id',
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search, $likeOperator) {
                $q->where('exams.title', $likeOperator, "%{$search}%")
                    ->orWhere('subjects.title', $likeOperator, "%{$search}%");
            });
        }

        if (! empty($filters['subject_id'])) {
            $query->where('exams.subject_id', $filters['subject_id']);
        }

        if (! empty($filters['teacher_id'])) {
            $query->where('exams.teacher_id', $filters['teacher_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('exams.status', $filters['status']);
        }

        $sort = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $query->orderBy("exams.{$sort}", $direction);

        $paginator = $query->paginate($perPage);

        $results = $paginator->through(function ($exam) {
            $exam->question_count = DB::table('questions')->where('exam_id', $exam->id)->count();
            $exam->session_count = DB::table('exam_sessions')->where('exam_id', $exam->id)->count();

            return $exam;
        });

        return $results;
    }

    public function find(string $id)
    {
        $exam = DB::table('exams')
            ->join('subjects', 'exams.subject_id', '=', 'subjects.id')
            ->join('teachers', 'exams.teacher_id', '=', 'teachers.id')
            ->where('exams.id', $id)
            ->select([
                'exams.*',
                'subjects.title as subject_title',
                'teachers.user_id as teacher_user_id',
            ])
            ->first();

        if ($exam) {
            $exam->question_count = DB::table('questions')->where('exam_id', $exam->id)->count();
            $exam->session_count = DB::table('exam_sessions')->where('exam_id', $exam->id)->count();
        }

        return $exam;
    }

    public function findWithQuestionsAndOptions(string $id)
    {
        $exam = $this->find($id);

        if (! $exam) {
            return null;
        }

        $questions = DB::table('questions')
            ->leftJoin('materials', 'questions.material_id', '=', 'materials.id')
            ->where('questions.exam_id', $id)
            ->select([
                'questions.*',
                'materials.title as material_title',
            ])
            ->orderBy('questions.order')
            ->get();

        foreach ($questions as $question) {
            $question->image_url = $this->formatImageUrl($question->image_path);

            if ($question->question_type === 'multiple_choice') {
                $question->options = DB::table('options')
                    ->where('question_id', $question->id)
                    ->orderBy('order')
                    ->get();
            } else {
                $question->options = [];
            }
        }

        $exam->questions = $questions;

        return $exam;
    }

    public function create(array $data)
    {
        $id = (string) Str::uuid();

        DB::table('exams')->insert([
            'id' => $id,
            'subject_id' => $data['subject_id'],
            'teacher_id' => $data['teacher_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'duration' => $data['duration'],
            'pass_score' => $data['pass_score'] ?? 75,
            'randomize_questions' => $data['randomize_questions'] ?? false,
            'randomize_options' => $data['randomize_options'] ?? false,
            'status' => $data['status'] ?? 'draft',
            'start_time' => $data['start_time'] ?? null,
            'end_time' => $data['end_time'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function update(string $id, array $data)
    {
        DB::table('exams')
            ->where('id', $id)
            ->update([
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'duration' => $data['duration'],
                'pass_score' => $data['pass_score'] ?? 75,
                'randomize_questions' => $data['randomize_questions'] ?? false,
                'randomize_options' => $data['randomize_options'] ?? false,
                'status' => $data['status'] ?? 'draft',
                'start_time' => $data['start_time'] ?? null,
                'end_time' => $data['end_time'] ?? null,
                'updated_at' => now(),
            ]);
    }

    public function delete(string $id)
    {
        $questions = DB::table('questions')->where('exam_id', $id)->get();
        foreach ($questions as $q) {
            if ($q->image_path) {
                Storage::disk('public')->delete($q->image_path);
            }
        }

        DB::table('exams')->where('id', $id)->delete();
    }

    public function addQuestion(string $examId, array $questionData, array $optionsData = [])
    {
        $questionId = (string) Str::uuid();

        $maxOrder = DB::table('questions')->where('exam_id', $examId)->max('order') ?? 0;

        DB::table('questions')->insert([
            'id' => $questionId,
            'exam_id' => $examId,
            'material_id' => $questionData['material_id'] ?? null,
            'question_text' => $questionData['question_text'],
            'question_type' => $questionData['question_type'],
            'image_path' => $questionData['image_path'] ?? null,
            'score' => $questionData['score'] ?? 1.0,
            'order' => $maxOrder + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($questionData['question_type'] === 'multiple_choice' && ! empty($optionsData)) {
            foreach ($optionsData as $idx => $opt) {
                DB::table('options')->insert([
                    'id' => (string) Str::uuid(),
                    'question_id' => $questionId,
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct'] ?? false,
                    'order' => $idx + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return $questionId;
    }

    public function updateQuestion(string $questionId, array $questionData, array $optionsData = [])
    {
        $updateFields = [
            'question_text' => $questionData['question_text'],
            'material_id' => $questionData['material_id'] ?? null,
            'question_type' => $questionData['question_type'],
            'score' => $questionData['score'] ?? 1.0,
            'updated_at' => now(),
        ];

        if (! empty($questionData['remove_image'])) {
            $existing = DB::table('questions')->where('id', $questionId)->first();
            if ($existing && $existing->image_path) {
                Storage::disk('public')->delete($existing->image_path);
            }
            $updateFields['image_path'] = null;
        } elseif (array_key_exists('image_path', $questionData)) {
            $existing = DB::table('questions')->where('id', $questionId)->first();
            if ($existing && $existing->image_path && $existing->image_path !== $questionData['image_path']) {
                Storage::disk('public')->delete($existing->image_path);
            }
            $updateFields['image_path'] = $questionData['image_path'];
        }

        DB::table('questions')
            ->where('id', $questionId)
            ->update($updateFields);

        if ($questionData['question_type'] === 'multiple_choice' && ! empty($optionsData)) {
            DB::table('options')->where('question_id', $questionId)->delete();

            foreach ($optionsData as $idx => $opt) {
                DB::table('options')->insert([
                    'id' => (string) Str::uuid(),
                    'question_id' => $questionId,
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct'] ?? false,
                    'order' => $idx + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } elseif ($questionData['question_type'] === 'essay') {
            DB::table('options')->where('question_id', $questionId)->delete();
        }
    }

    private function formatImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return '/storage/'.ltrim($path, '/');
    }

    public function deleteQuestion(string $questionId)
    {
        $question = DB::table('questions')->where('id', $questionId)->first();
        if ($question && $question->image_path) {
            Storage::disk('public')->delete($question->image_path);
        }

        DB::table('questions')->where('id', $questionId)->delete();
    }

    public function getExamSessions(string $examId)
    {
        return DB::table('exam_sessions')
            ->join('students', 'exam_sessions.student_id', '=', 'students.id')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->where('exam_sessions.exam_id', $examId)
            ->select([
                'exam_sessions.*',
                'users.name as student_name',
                'students.nisn',
            ])
            ->orderBy('exam_sessions.created_at', 'desc')
            ->get();
    }

    public function getPublishedExamsBySubject(string $subjectId)
    {
        $now = now();
        $tzOffset = $now->format('P');
        $tzName = config('app.timezone', 'Asia/Jakarta');

        return DB::table('exams')
            ->where('subject_id', $subjectId)
            ->where('status', 'published')
            ->select([
                'id',
                'subject_id',
                'title',
                'description',
                'duration',
                'pass_score',
                'start_time',
                'end_time',
                'created_at',
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($exam) use ($now, $tzOffset, $tzName) {
                $exam->question_count = DB::table('questions')->where('exam_id', $exam->id)->count();

                // ISO 8601 Timezone Aware Datetimes for Mobile
                $exam->start_time_iso = $exam->start_time ? Carbon::parse($exam->start_time, $tzName)->toIso8601String() : null;
                $exam->end_time_iso = $exam->end_time ? Carbon::parse($exam->end_time, $tzName)->toIso8601String() : null;
                $exam->server_time_iso = $now->toIso8601String();
                $exam->timezone_offset = $tzOffset;
                $exam->timezone_name = $tzName;

                return $exam;
            });
    }

    public function getStudentExamSession(string $examId, string $studentId)
    {
        return DB::table('exam_sessions')
            ->where('exam_id', $examId)
            ->where('student_id', $studentId)
            ->first();
    }

    public function createExamSession(string $examId, string $studentId)
    {
        $id = (string) Str::uuid();

        DB::table('exam_sessions')->insert([
            'id' => $id,
            'exam_id' => $examId,
            'student_id' => $studentId,
            'started_at' => now(),
            'status' => 'in_progress',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function findExamSession(string $sessionId)
    {
        $session = DB::table('exam_sessions')
            ->join('exams', 'exam_sessions.exam_id', '=', 'exams.id')
            ->where('exam_sessions.id', $sessionId)
            ->select([
                'exam_sessions.*',
                'exams.title as exam_title',
                'exams.duration',
                'exams.pass_score',
                'exams.randomize_questions',
                'exams.randomize_options',
                'exams.start_time',
                'exams.end_time',
            ])
            ->first();

        if ($session) {
            $tzName = config('app.timezone', 'Asia/Jakarta');
            $now = now();
            $startedAt = Carbon::parse($session->started_at, $tzName);
            $durationSeconds = (int) $session->duration * 60;
            $elapsedSeconds = (int) $startedAt->diffInSeconds($now, false);
            $remainingSeconds = max(0, $durationSeconds - max(0, $elapsedSeconds));

            $session->started_at_iso = $startedAt->toIso8601String();
            $session->submitted_at_iso = $session->submitted_at ? Carbon::parse($session->submitted_at, $tzName)->toIso8601String() : null;
            $session->start_time_iso = $session->start_time ? Carbon::parse($session->start_time, $tzName)->toIso8601String() : null;
            $session->end_time_iso = $session->end_time ? Carbon::parse($session->end_time, $tzName)->toIso8601String() : null;
            $session->server_time_iso = $now->toIso8601String();
            $session->timezone_offset = $now->format('P');
            $session->timezone_name = config('app.timezone', 'Asia/Jakarta');

            $session->duration_seconds = $durationSeconds;
            $session->remaining_seconds = $remainingSeconds;
            $session->is_expired = $remainingSeconds <= 0;
        }

        return $session;
    }

    public function getExamQuestionsForStudent(string $examId, bool $randomizeQuestions = false, bool $randomizeOptions = false)
    {
        $query = DB::table('questions')
            ->leftJoin('materials', 'questions.material_id', '=', 'materials.id')
            ->where('questions.exam_id', $examId)
            ->select([
                'questions.id',
                'questions.exam_id',
                'questions.material_id',
                'questions.question_text',
                'questions.question_type',
                'questions.image_path',
                'questions.score',
                'questions.order',
                'materials.title as material_title',
            ]);

        if ($randomizeQuestions) {
            $query->inRandomOrder();
        } else {
            $query->orderBy('questions.order');
        }

        $questions = $query->get();

        foreach ($questions as $question) {
            $question->image_url = $this->formatImageUrl($question->image_path);

            if ($question->question_type === 'multiple_choice') {
                $optQuery = DB::table('options')
                    ->where('question_id', $question->id)
                    ->select(['id', 'question_id', 'option_text', 'order']);

                if ($randomizeOptions) {
                    $optQuery->inRandomOrder();
                } else {
                    $optQuery->orderBy('order');
                }

                $question->options = $optQuery->get();
            } else {
                $question->options = [];
            }
        }

        return $questions;
    }

    public function getSavedStudentAnswers(string $sessionId)
    {
        return DB::table('student_answers')
            ->where('exam_session_id', $sessionId)
            ->select([
                'question_id',
                'selected_option_id',
                'essay_answer',
                'updated_at',
            ])
            ->get()
            ->keyBy('question_id');
    }

    public function saveMultipleStudentAnswers(string $sessionId, array $answersList)
    {
        foreach ($answersList as $item) {
            if (! empty($item['question_id'])) {
                $this->saveStudentAnswer(
                    $sessionId,
                    $item['question_id'],
                    $item['selected_option_id'] ?? null,
                    $item['essay_answer'] ?? null
                );
            }
        }
    }

    public function saveStudentAnswer(string $sessionId, string $questionId, ?string $selectedOptionId = null, ?string $essayAnswer = null)
    {
        $question = DB::table('questions')->where('id', $questionId)->first();
        if (! $question) {
            return;
        }

        $isCorrect = null;
        $scoreEarned = 0.0;

        if ($question->question_type === 'multiple_choice' && $selectedOptionId) {
            $option = DB::table('options')->where('id', $selectedOptionId)->first();
            $isCorrect = $option ? (bool) $option->is_correct : false;
            $scoreEarned = $isCorrect ? (float) $question->score : 0.0;
        }

        $existing = DB::table('student_answers')
            ->where('exam_session_id', $sessionId)
            ->where('question_id', $questionId)
            ->first();

        if ($existing) {
            DB::table('student_answers')
                ->where('id', $existing->id)
                ->update([
                    'selected_option_id' => $selectedOptionId,
                    'essay_answer' => $essayAnswer,
                    'is_correct' => $isCorrect,
                    'score_earned' => $scoreEarned,
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('student_answers')->insert([
                'id' => (string) Str::uuid(),
                'exam_session_id' => $sessionId,
                'question_id' => $questionId,
                'selected_option_id' => $selectedOptionId,
                'essay_answer' => $essayAnswer,
                'is_correct' => $isCorrect,
                'score_earned' => $scoreEarned,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function submitExamSession(string $sessionId)
    {
        $totalScore = DB::table('student_answers')
            ->where('exam_session_id', $sessionId)
            ->sum('score_earned');

        DB::table('exam_sessions')
            ->where('id', $sessionId)
            ->update([
                'status' => 'submitted',
                'submitted_at' => now(),
                'total_score' => (float) $totalScore,
                'updated_at' => now(),
            ]);

        return (float) $totalScore;
    }

    public function getExamResultDetails(string $sessionId)
    {
        $session = DB::table('exam_sessions')
            ->join('exams', 'exam_sessions.exam_id', '=', 'exams.id')
            ->where('exam_sessions.id', $sessionId)
            ->select([
                'exam_sessions.*',
                'exams.title as exam_title',
                'exams.pass_score',
                'exams.duration',
            ])
            ->first();

        if (! $session) {
            return null;
        }

        $now = now();
        $tzName = config('app.timezone', 'Asia/Jakarta');
        $session->started_at_iso = Carbon::parse($session->started_at, $tzName)->toIso8601String();
        $session->submitted_at_iso = $session->submitted_at ? Carbon::parse($session->submitted_at, $tzName)->toIso8601String() : null;
        $session->server_time_iso = $now->toIso8601String();
        $session->timezone_offset = $now->format('P');
        $session->timezone_name = config('app.timezone', 'Asia/Jakarta');

        $session->is_passed = ($session->total_score ?? 0) >= $session->pass_score;

        $answers = DB::table('student_answers')
            ->join('questions', 'student_answers.question_id', '=', 'questions.id')
            ->leftJoin('materials', 'questions.material_id', '=', 'materials.id')
            ->leftJoin('options', 'student_answers.selected_option_id', '=', 'options.id')
            ->where('student_answers.exam_session_id', $sessionId)
            ->select([
                'student_answers.id',
                'student_answers.question_id',
                'student_answers.selected_option_id',
                'student_answers.essay_answer',
                'student_answers.is_correct',
                'student_answers.score_earned',
                'questions.question_text',
                'questions.question_type',
                'questions.score as max_score',
                'questions.material_id',
                'materials.title as material_title',
                'options.option_text as selected_option_text',
            ])
            ->get();

        $session->answers = $answers;

        return $session;
    }
}
