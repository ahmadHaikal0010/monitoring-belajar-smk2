<?php

namespace App\Repositories;

use App\Repositories\Interfaces\ExamRepositoryInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Uid\Uuid;

class SqlExamRepository implements ExamRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('ujian')
            ->join('mata_pelajaran', 'ujian.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->join('guru', 'ujian.id_guru', '=', 'guru.id')
            ->select([
                'ujian.id',
                'ujian.id_mata_pelajaran as subject_id',
                'ujian.id_guru as teacher_id',
                'ujian.judul as title',
                'ujian.deskripsi as description',
                'ujian.durasi as duration',
                'ujian.nilai_kkm as pass_score',
                'ujian.acak_soal as randomize_questions',
                'ujian.acak_opsi as randomize_options',
                'ujian.status',
                'ujian.waktu_mulai as start_time',
                'ujian.waktu_selesai as end_time',
                'ujian.created_at',
                'mata_pelajaran.judul as subject_title',
                'guru.id as teacher_id',
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search, $likeOperator) {
                $q->where('ujian.judul', $likeOperator, "%{$search}%")
                    ->orWhere('mata_pelajaran.judul', $likeOperator, "%{$search}%");
            });
        }

        if (! empty($filters['subject_id'])) {
            $query->where('ujian.id_mata_pelajaran', $filters['subject_id']);
        }

        if (! empty($filters['teacher_id'])) {
            $query->where('ujian.id_guru', $filters['teacher_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('ujian.status', $filters['status']);
        }

        $sortMap = [
            'title' => 'judul',
            'created_at' => 'created_at',
            'status' => 'status',
        ];
        $sort = $filters['sort'] ?? 'created_at';
        $dbSort = $sortMap[$sort] ?? 'created_at';
        $direction = $filters['direction'] ?? 'desc';
        $query->orderBy("ujian.{$dbSort}", $direction);

        $paginator = $query->paginate($perPage);

        $results = $paginator->through(function ($exam) {
            $exam->question_count = DB::table('soal')->where('id_ujian', $exam->id)->count();
            $exam->session_count = DB::table('sesi_ujian')->where('id_ujian', $exam->id)->count();

            return $exam;
        });

        return $results;
    }

    public function find(string $id)
    {
        $exam = DB::table('ujian')
            ->join('mata_pelajaran', 'ujian.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->join('guru', 'ujian.id_guru', '=', 'guru.id')
            ->where('ujian.id', $id)
            ->select([
                'ujian.id',
                'ujian.id_mata_pelajaran as subject_id',
                'ujian.id_guru as teacher_id',
                'ujian.judul as title',
                'ujian.deskripsi as description',
                'ujian.durasi as duration',
                'ujian.nilai_kkm as pass_score',
                'ujian.acak_soal as randomize_questions',
                'ujian.acak_opsi as randomize_options',
                'ujian.status',
                'ujian.waktu_mulai as start_time',
                'ujian.waktu_selesai as end_time',
                'ujian.created_at',
                'mata_pelajaran.judul as subject_title',
                'guru.id_pengguna as teacher_user_id',
            ])
            ->first();

        if ($exam) {
            $exam->question_count = DB::table('soal')->where('id_ujian', $exam->id)->count();
            $exam->session_count = DB::table('sesi_ujian')->where('id_ujian', $exam->id)->count();
        }

        return $exam;
    }

    public function findWithQuestionsAndOptions(string $id)
    {
        $exam = $this->find($id);

        if (! $exam) {
            return null;
        }

        $questions = DB::table('soal')
            ->leftJoin('materi', 'soal.id_materi', '=', 'materi.id')
            ->where('soal.id_ujian', $id)
            ->select([
                'soal.id',
                'soal.id_ujian as exam_id',
                'soal.id_materi as material_id',
                'soal.teks_soal as question_text',
                'soal.tipe_soal as question_type',
                'soal.jalur_gambar as image_path',
                'soal.bobot_skor as score',
                'soal.urutan as order',
                'soal.created_at',
                'materi.judul as material_title',
            ])
            ->orderBy('soal.urutan')
            ->get();

        foreach ($questions as $question) {
            $question->image_url = $this->formatImageUrl($question->image_path);

            if ($question->question_type === 'multiple_choice') {
                $question->options = DB::table('opsi_jawaban')
                    ->where('id_soal', $question->id)
                    ->select([
                        'id',
                        'id_soal as question_id',
                        'teks_opsi as option_text',
                        'benar as is_correct',
                        'urutan as order',
                    ])
                    ->orderBy('urutan')
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
        $id = (string) Uuid::v7();

        DB::table('ujian')->insert([
            'id' => $id,
            'id_mata_pelajaran' => $data['subject_id'],
            'id_guru' => $data['teacher_id'],
            'judul' => $data['title'],
            'deskripsi' => $data['description'] ?? null,
            'durasi' => $data['duration'],
            'nilai_kkm' => $data['pass_score'] ?? 75,
            'acak_soal' => $data['randomize_questions'] ?? false,
            'acak_opsi' => $data['randomize_options'] ?? false,
            'status' => $data['status'] ?? 'draft',
            'waktu_mulai' => $data['start_time'] ?? null,
            'waktu_selesai' => $data['end_time'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function update(string $id, array $data)
    {
        $fieldMap = [
            'subject_id' => 'id_mata_pelajaran',
            'teacher_id' => 'id_guru',
            'title' => 'judul',
            'description' => 'deskripsi',
            'duration' => 'durasi',
            'pass_score' => 'nilai_kkm',
            'randomize_questions' => 'acak_soal',
            'randomize_options' => 'acak_opsi',
            'status' => 'status',
            'start_time' => 'waktu_mulai',
            'end_time' => 'waktu_selesai',
        ];

        $updateFields = [];
        foreach ($fieldMap as $apiKey => $dbCol) {
            if (array_key_exists($apiKey, $data)) {
                $updateFields[$dbCol] = $data[$apiKey];
            } elseif (array_key_exists($dbCol, $data)) {
                $updateFields[$dbCol] = $data[$dbCol];
            }
        }

        $updateFields['updated_at'] = now();

        DB::table('ujian')
            ->where('id', $id)
            ->update($updateFields);
    }

    public function delete(string $id)
    {
        $questions = DB::table('soal')->where('id_ujian', $id)->get();
        foreach ($questions as $q) {
            if ($q->jalur_gambar) {
                Storage::disk('public')->delete($q->jalur_gambar);
            }
        }

        DB::table('ujian')->where('id', $id)->delete();
    }

    public function addQuestion(string $examId, array $questionData, array $optionsData = [])
    {
        $questionId = (string) Uuid::v7();

        $maxOrder = DB::table('soal')->where('id_ujian', $examId)->max('urutan') ?? 0;

        DB::table('soal')->insert([
            'id' => $questionId,
            'id_ujian' => $examId,
            'id_materi' => $questionData['material_id'] ?? null,
            'teks_soal' => $questionData['question_text'],
            'tipe_soal' => $questionData['question_type'],
            'jalur_gambar' => $questionData['image_path'] ?? null,
            'bobot_skor' => $questionData['score'] ?? 1.0,
            'urutan' => $maxOrder + 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if ($questionData['question_type'] === 'multiple_choice' && ! empty($optionsData)) {
            foreach ($optionsData as $idx => $opt) {
                DB::table('opsi_jawaban')->insert([
                    'id' => (string) Uuid::v7(),
                    'id_soal' => $questionId,
                    'teks_opsi' => $opt['option_text'],
                    'benar' => $opt['is_correct'] ?? false,
                    'urutan' => $idx + 1,
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
            'teks_soal' => $questionData['question_text'],
            'id_materi' => $questionData['material_id'] ?? null,
            'tipe_soal' => $questionData['question_type'],
            'bobot_skor' => $questionData['score'] ?? 1.0,
            'updated_at' => now(),
        ];

        if (! empty($questionData['remove_image'])) {
            $existing = DB::table('soal')->where('id', $questionId)->first();
            if ($existing && $existing->jalur_gambar) {
                Storage::disk('public')->delete($existing->jalur_gambar);
            }
            $updateFields['jalur_gambar'] = null;
        } elseif (array_key_exists('image_path', $questionData)) {
            $existing = DB::table('soal')->where('id', $questionId)->first();
            if ($existing && $existing->jalur_gambar && $existing->jalur_gambar !== $questionData['image_path']) {
                Storage::disk('public')->delete($existing->jalur_gambar);
            }
            $updateFields['jalur_gambar'] = $questionData['image_path'];
        }

        DB::table('soal')
            ->where('id', $questionId)
            ->update($updateFields);

        if ($questionData['question_type'] === 'multiple_choice' && ! empty($optionsData)) {
            DB::table('opsi_jawaban')->where('id_soal', $questionId)->delete();

            foreach ($optionsData as $idx => $opt) {
                DB::table('opsi_jawaban')->insert([
                    'id' => (string) Uuid::v7(),
                    'id_soal' => $questionId,
                    'teks_opsi' => $opt['option_text'],
                    'benar' => $opt['is_correct'] ?? false,
                    'urutan' => $idx + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } elseif ($questionData['question_type'] === 'essay') {
            DB::table('opsi_jawaban')->where('id_soal', $questionId)->delete();
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

        return url('storage/'.ltrim($path, '/'));
    }

    public function deleteQuestion(string $questionId)
    {
        $question = DB::table('soal')->where('id', $questionId)->first();
        if ($question && $question->jalur_gambar) {
            Storage::disk('public')->delete($question->jalur_gambar);
        }

        DB::table('soal')->where('id', $questionId)->delete();
    }

    public function getExamSessions(string $examId)
    {
        return DB::table('sesi_ujian')
            ->join('siswa', 'sesi_ujian.id_siswa', '=', 'siswa.id')
            ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
            ->where('sesi_ujian.id_ujian', $examId)
            ->select([
                'sesi_ujian.id',
                'sesi_ujian.id_ujian as exam_id',
                'sesi_ujian.id_siswa as student_id',
                'sesi_ujian.dimulai_pada as started_at',
                'sesi_ujian.dikumpulkan_pada as submitted_at',
                'sesi_ujian.total_skor as total_score',
                'sesi_ujian.status',
                'sesi_ujian.created_at',
                'pengguna.nama as student_name',
                'siswa.nisn',
            ])
            ->orderBy('sesi_ujian.created_at', 'desc')
            ->get();
    }

    public function getPublishedExamsBySubject(string $subjectId)
    {
        $now = now();
        $tzOffset = $now->format('P');
        $tzName = config('app.timezone', 'Asia/Jakarta');

        return DB::table('ujian')
            ->where('id_mata_pelajaran', $subjectId)
            ->where('status', 'published')
            ->select([
                'id',
                'id_mata_pelajaran as subject_id',
                'judul as title',
                'deskripsi as description',
                'durasi as duration',
                'nilai_kkm as pass_score',
                'waktu_mulai as start_time',
                'waktu_selesai as end_time',
                'created_at',
            ])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($exam) use ($now, $tzOffset, $tzName) {
                $exam->question_count = DB::table('soal')->where('id_ujian', $exam->id)->count();

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
        return DB::table('sesi_ujian')
            ->where('id_ujian', $examId)
            ->where('id_siswa', $studentId)
            ->select([
                'id',
                'id_ujian as exam_id',
                'id_siswa as student_id',
                'dimulai_pada as started_at',
                'dikumpulkan_pada as submitted_at',
                'total_skor as total_score',
                'status',
                'created_at',
            ])
            ->first();
    }

    public function createExamSession(string $examId, string $studentId)
    {
        $id = (string) Uuid::v7();

        DB::table('sesi_ujian')->insert([
            'id' => $id,
            'id_ujian' => $examId,
            'id_siswa' => $studentId,
            'dimulai_pada' => now(),
            'status' => 'in_progress',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function findExamSession(string $sessionId)
    {
        $session = DB::table('sesi_ujian')
            ->join('ujian', 'sesi_ujian.id_ujian', '=', 'ujian.id')
            ->where('sesi_ujian.id', $sessionId)
            ->select([
                'sesi_ujian.id',
                'sesi_ujian.id_ujian as exam_id',
                'sesi_ujian.id_siswa as student_id',
                'sesi_ujian.dimulai_pada as started_at',
                'sesi_ujian.dikumpulkan_pada as submitted_at',
                'sesi_ujian.total_skor as total_score',
                'sesi_ujian.status',
                'ujian.judul as exam_title',
                'ujian.durasi as duration',
                'ujian.nilai_kkm as pass_score',
                'ujian.acak_soal as randomize_questions',
                'ujian.acak_opsi as randomize_options',
                'ujian.waktu_mulai as start_time',
                'ujian.waktu_selesai as end_time',
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
        $query = DB::table('soal')
            ->leftJoin('materi', 'soal.id_materi', '=', 'materi.id')
            ->where('soal.id_ujian', $examId)
            ->select([
                'soal.id',
                'soal.id_ujian as exam_id',
                'soal.id_materi as material_id',
                'soal.teks_soal as question_text',
                'soal.tipe_soal as question_type',
                'soal.jalur_gambar as image_path',
                'soal.bobot_skor as score',
                'soal.urutan as order',
                'materi.judul as material_title',
            ]);

        if ($randomizeQuestions) {
            $query->inRandomOrder();
        } else {
            $query->orderBy('soal.urutan');
        }

        $questions = $query->get();

        foreach ($questions as $question) {
            $question->image_url = $this->formatImageUrl($question->image_path);

            if ($question->question_type === 'multiple_choice') {
                $optQuery = DB::table('opsi_jawaban')
                    ->where('id_soal', $question->id)
                    ->select(['id', 'id_soal as question_id', 'teks_opsi as option_text', 'urutan as order']);

                if ($randomizeOptions) {
                    $optQuery->inRandomOrder();
                } else {
                    $optQuery->orderBy('urutan');
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
        return DB::table('jawaban_siswa')
            ->where('id_sesi_ujian', $sessionId)
            ->select([
                'id_soal as question_id',
                'id_opsi_dipilih as selected_option_id',
                'jawaban_esai as essay_answer',
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
        $question = DB::table('soal')->where('id', $questionId)->first();
        if (! $question) {
            return;
        }

        $isCorrect = null;
        $scoreEarned = 0.0;

        if ($question->tipe_soal === 'multiple_choice' && $selectedOptionId) {
            $option = DB::table('opsi_jawaban')->where('id', $selectedOptionId)->first();
            $isCorrect = $option ? (bool) $option->benar : false;
            $scoreEarned = $isCorrect ? (float) $question->bobot_skor : 0.0;
        }

        $existing = DB::table('jawaban_siswa')
            ->where('id_sesi_ujian', $sessionId)
            ->where('id_soal', $questionId)
            ->first();

        if ($existing) {
            DB::table('jawaban_siswa')
                ->where('id', $existing->id)
                ->update([
                    'id_opsi_dipilih' => $selectedOptionId,
                    'jawaban_esai' => $essayAnswer,
                    'benar' => $isCorrect,
                    'skor_diperoleh' => $scoreEarned,
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('jawaban_siswa')->insert([
                'id' => (string) Uuid::v7(),
                'id_sesi_ujian' => $sessionId,
                'id_soal' => $questionId,
                'id_opsi_dipilih' => $selectedOptionId,
                'jawaban_esai' => $essayAnswer,
                'benar' => $isCorrect,
                'skor_diperoleh' => $scoreEarned,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function submitExamSession(string $sessionId)
    {
        $totalScore = DB::table('jawaban_siswa')
            ->where('id_sesi_ujian', $sessionId)
            ->sum('skor_diperoleh');

        DB::table('sesi_ujian')
            ->where('id', $sessionId)
            ->update([
                'status' => 'submitted',
                'dikumpulkan_pada' => now(),
                'total_skor' => (float) $totalScore,
                'updated_at' => now(),
            ]);

        return (float) $totalScore;
    }

    public function getExamResultDetails(string $sessionId)
    {
        $session = DB::table('sesi_ujian')
            ->join('ujian', 'sesi_ujian.id_ujian', '=', 'ujian.id')
            ->where('sesi_ujian.id', $sessionId)
            ->select([
                'sesi_ujian.id',
                'sesi_ujian.id_ujian as exam_id',
                'sesi_ujian.id_siswa as student_id',
                'sesi_ujian.dimulai_pada as started_at',
                'sesi_ujian.dikumpulkan_pada as submitted_at',
                'sesi_ujian.total_skor as total_score',
                'sesi_ujian.status',
                'ujian.judul as exam_title',
                'ujian.nilai_kkm as pass_score',
                'ujian.durasi as duration',
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

        $answers = DB::table('jawaban_siswa')
            ->join('soal', 'jawaban_siswa.id_soal', '=', 'soal.id')
            ->leftJoin('materi', 'soal.id_materi', '=', 'materi.id')
            ->leftJoin('opsi_jawaban', 'jawaban_siswa.id_opsi_dipilih', '=', 'opsi_jawaban.id')
            ->where('jawaban_siswa.id_sesi_ujian', $sessionId)
            ->select([
                'jawaban_siswa.id',
                'jawaban_siswa.id_soal as question_id',
                'jawaban_siswa.id_opsi_dipilih as selected_option_id',
                'jawaban_siswa.jawaban_esai as essay_answer',
                'jawaban_siswa.benar as is_correct',
                'jawaban_siswa.skor_diperoleh as score_earned',
                'soal.teks_soal as question_text',
                'soal.tipe_soal as question_type',
                'soal.bobot_skor as max_score',
                'soal.id_materi as material_id',
                'materi.judul as material_title',
                'opsi_jawaban.teks_opsi as selected_option_text',
            ])
            ->get();

        $session->answers = $answers;

        return $session;
    }
}
