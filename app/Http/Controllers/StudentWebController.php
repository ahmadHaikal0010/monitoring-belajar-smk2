<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Exam;
use App\Models\Material;
use App\Models\Subject;
use App\Services\AssignmentService;
use App\Services\EnrollmentService;
use App\Services\ExamService;
use App\Services\MaterialService;
use App\Services\StudentProgressService;
use App\Services\StudentService;
use App\Services\SubjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentWebController extends Controller
{
    public function __construct(
        protected StudentService $studentService,
        protected EnrollmentService $enrollmentService,
        protected SubjectService $subjectService,
        protected MaterialService $materialService,
        protected StudentProgressService $studentProgressService,
        protected AssignmentService $assignmentService,
        protected ExamService $examService
    ) {}

    /**
     * Get authenticated student or fail.
     */
    protected function getStudentOrAbort()
    {
        $user = auth()->user();
        if ($user->role !== 'siswa') {
            abort(403, 'Akses ini khusus untuk siswa.');
        }

        $student = $this->studentService->getStudentByUserId($user->id);
        if (! $student) {
            abort(404, 'Data profil siswa Anda tidak ditemukan. Harap hubungi administrator.');
        }

        return $student;
    }

    /**
     * Browse available subjects and current enrollment status.
     */
    public function subjects(Request $request)
    {
        $student = $this->getStudentOrAbort();

        $search = $request->query('search');
        $enrolledOnly = $request->has('enrolled_only') ? $request->boolean('enrolled_only') : true;

        $classEnrollment = DB::table('anggota_kelas')
            ->where('id_siswa', $student->id)
            ->where('status', 'aktif')
            ->first();

        $studentClassroomId = $classEnrollment?->id_kelas;

        $allowedSubjectIds = $studentClassroomId ? DB::table('kelas_mata_pelajaran')
            ->where('id_kelas', $studentClassroomId)
            ->pluck('id_mata_pelajaran')
            ->toArray() : [];

        $enrolledSubjectIds = DB::table('pendaftaran')
            ->where('id_siswa', $student->id)
            ->pluck('id_mata_pelajaran')
            ->toArray();

        $enrolledMap = array_flip($enrolledSubjectIds);

        $query = DB::table('mata_pelajaran')
            ->leftJoin('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->leftJoin('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->select([
                'mata_pelajaran.id',
                'mata_pelajaran.judul as title',
                'mata_pelajaran.kode as code',
                'mata_pelajaran.deskripsi as description',
                'mata_pelajaran.created_at',
                'pengguna.nama as teacher_name',
                'pengguna.email as teacher_email',
            ]);

        if (! empty($allowedSubjectIds)) {
            $query->whereIn('mata_pelajaran.id', $allowedSubjectIds);
        } else {
            $query->whereRaw('1 = 0');
        }

        if ($enrolledOnly) {
            $query->whereIn('mata_pelajaran.id', $enrolledSubjectIds);
        }

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('mata_pelajaran.judul', 'like', "%{$search}%")
                    ->orWhere('mata_pelajaran.kode', 'like', "%{$search}%")
                    ->orWhere('pengguna.nama', 'like', "%{$search}%");
            });
        }

        $paginated = $query->orderBy('mata_pelajaran.judul', 'asc')
            ->paginate(9)
            ->withQueryString();

        $paginated->getCollection()->transform(function ($subj) use ($student, $enrolledMap) {
            $isEnrolled = isset($enrolledMap[$subj->id]);

            $totalMaterials = DB::table('materi')->where('id_mata_pelajaran', $subj->id)->count();
            $completedMaterials = 0;

            if ($isEnrolled) {
                $enrollment = DB::table('pendaftaran')
                    ->where('id_siswa', $student->id)
                    ->where('id_mata_pelajaran', $subj->id)
                    ->first();

                if ($enrollment) {
                    $completedMaterials = DB::table('progres_siswa')
                        ->where('id_pendaftaran', $enrollment->id)
                        ->where('selesai', true)
                        ->count();
                }
            }

            $percentage = $totalMaterials > 0 ? (int) round(($completedMaterials / $totalMaterials) * 100) : 0;

            return [
                'id' => $subj->id,
                'title' => $subj->title,
                'code' => $subj->code,
                'description' => $subj->description,
                'teacher_name' => $subj->teacher_name ?? 'Pengajar',
                'teacher_email' => $subj->teacher_email,
                'is_enrolled' => $isEnrolled,
                'total_materials' => $totalMaterials,
                'completed_materials' => $completedMaterials,
                'percentage' => $percentage,
            ];
        });

        return Inertia::render('Student/Subjects/index', [
            'subjects' => $paginated,
            'filters' => [
                'search' => $search ?? '',
                'enrolled_only' => $enrolledOnly,
            ],
            'has_classroom' => (bool) $studentClassroomId,
        ]);
    }

    /**
     * Handle student enrollment / unenrollment.
     */
    public function toggleEnroll(Request $request, Subject $subject)
    {
        $student = $this->getStudentOrAbort();

        $existing = DB::table('pendaftaran')
            ->where('id_siswa', $student->id)
            ->where('id_mata_pelajaran', $subject->id)
            ->first();

        if ($existing) {
            $this->enrollmentService->unenrollStudent($student->id, $subject->id);

            return redirect()->back()->with('success', "Berhasil melepaskan pendaftaran dari mata pelajaran {$subject->judul}.");
        }

        $this->enrollmentService->enrollStudent($student->id, $subject->id);

        return redirect()->back()->with('success', "Berhasil mendaftar ke mata pelajaran {$subject->judul}.");
    }

    /**
     * Materials view for a specific subject.
     */
    public function showSubject(Subject $subject)
    {
        $student = $this->getStudentOrAbort();

        if (! $this->enrollmentService->checkEnrollment($student->id, $subject->id)) {
            return redirect()->route('student.subjects.index')
                ->with('error', 'Anda harus mendaftar pada mata pelajaran ini terlebih dahulu.');
        }

        // 1. DATA & PROGRES MATERI
        $materials = $this->materialService->getMaterialsBySubjectId($subject->id);
        $completedMaterialIds = $this->studentProgressService->getCompletedMaterialIds($student->id, $subject->id);

        $materialsData = collect($materials)->map(function ($m) use ($completedMaterialIds) {
            return [
                'id' => $m->id,
                'title' => $m->title,
                'content_type' => $m->content_type,
                'description' => $m->description,
                'created_at' => $m->created_at,
                'is_completed' => in_array($m->id, $completedMaterialIds),
            ];
        });

        $totalMaterials = count($materialsData);
        $completedMaterialsCount = count($completedMaterialIds);
        $materialsPercentage = $totalMaterials > 0 ? (int) round(($completedMaterialsCount / $totalMaterials) * 100) : 0;

        // 2. DATA & PROGRES TUGAS
        $assignmentData = $this->assignmentService->getStudentAssignmentsForSubject($subject->id, $student->id);
        $totalAssignments = count($assignmentData);

        // Hitung tugas yang sudah dikumpulkan/dinilai (sesuaikan status dengan Service Anda, misal: 'submitted', 'graded', 'terkumpul')
        $completedAssignmentsCount = collect($assignmentData)->filter(function ($a) {
            $status = is_array($a) ? ($a['submission_status'] ?? $a['status'] ?? '') : ($a->submission_status ?? $a->status ?? '');

            return in_array($status, ['submitted', 'graded', 'completed', 'terkumpul']);
        })->count();
        $assignmentsPercentage = $totalAssignments > 0 ? (int) round(($completedAssignmentsCount / $totalAssignments) * 100) : 0;

        // 3. DATA & PROGRES UJIAN
        $examData = $this->examService->getStudentExamsForSubject($subject->id, $student->id);
        $totalExams = count($examData);

        // Hitung ujian yang sudah dikerjakan (sesi bernilai: 'submitted', 'graded', 'timed_out', dll)
        $completedExamsCount = collect($examData)->filter(function ($e) {
            $session = is_array($e) ? ($e['student_session'] ?? $e['session'] ?? null) : ($e->student_session ?? $e->session ?? null);
            $status = is_array($e) ? ($e['status'] ?? '') : ($e->status ?? '');

            // Cek status langsung atau via student_session
            $sessionStatus = is_array($session) ? ($session['status'] ?? '') : ($session->status ?? '');

            return in_array($status, ['submitted', 'graded', 'timed_out', 'completed', 'finished']) ||
                in_array($sessionStatus, ['submitted', 'graded', 'timed_out', 'completed', 'finished']);
        })->count();
        $examsPercentage = $totalExams > 0 ? (int) round(($completedExamsCount / $totalExams) * 100) : 0;

        return Inertia::render('Student/Subjects/show', [
            'subject' => $subject,
            'materials' => $materialsData,
            'assignments' => $assignmentData,
            'exams' => $examData,
            'progress' => [
                'materials' => [
                    'completed' => $completedMaterialsCount,
                    'total' => $totalMaterials,
                    'percentage' => $materialsPercentage,
                ],
                'assignments' => [
                    'completed' => $completedAssignmentsCount,
                    'total' => $totalAssignments,
                    'percentage' => $assignmentsPercentage,
                ],
                'exams' => [
                    'completed' => $completedExamsCount,
                    'total' => $totalExams,
                    'percentage' => $examsPercentage,
                ],
            ],
        ]);
    }

    /**
     * Alias route for subject materials view (used by breadcrumbs).
     */
    public function materials(Subject $subject)
    {
        return $this->showSubject($subject);
    }

    /**
     * Show interactive material reader page.
     */
    public function showMaterial(Material $material)
    {
        $student = $this->getStudentOrAbort();

        if (! $this->enrollmentService->checkEnrollment($student->id, $material->id_mata_pelajaran)) {
            abort(403, 'Anda belum terdaftar pada mata pelajaran ini.');
        }

        $subject = $this->subjectService->getSubjectById($material->id_mata_pelajaran);
        $completedMaterialIds = $this->studentProgressService->getCompletedMaterialIds($student->id, $material->id_mata_pelajaran);

        $allMaterials = DB::table('materi')
            ->where('id_mata_pelajaran', $material->id_mata_pelajaran)
            ->select(['id', 'judul as title', 'tipe_konten as content_type'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($item) use ($completedMaterialIds) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content_type' => $item->content_type,
                    'is_completed' => in_array($item->id, $completedMaterialIds),
                ];
            });

        return Inertia::render('Student/Materials/show', [
            'subject' => $subject,
            'material' => [
                'id' => $material->id,
                'subject_id' => $material->id_mata_pelajaran,
                'title' => $material->judul,
                'content_type' => $material->tipe_konten,
                'content' => $material->isi_konten,
                'description' => $material->deskripsi,
                'created_at' => $material->created_at,
                'is_completed' => in_array($material->id, $completedMaterialIds),
            ],
            'all_materials' => $allMaterials,
        ]);
    }

    /**
     * Mark material as completed.
     */
    public function completeMaterial(Material $material)
    {
        $student = $this->getStudentOrAbort();

        $this->studentProgressService->markAsCompleted($student->id, $material->id);

        return redirect()->back()->with('success', 'Materi berhasil ditandai sebagai selesai!');
    }

    /**
     * List assignments for enrolled subjects.
     */
    public function assignments(Request $request)
    {
        $student = $this->getStudentOrAbort();

        $enrolledSubjectIds = DB::table('pendaftaran')
            ->where('id_siswa', $student->id)
            ->pluck('id_mata_pelajaran')
            ->toArray();

        $assignmentsQuery = DB::table('tugas')
            ->join('mata_pelajaran', 'tugas.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->leftJoin('pengumpulan_tugas', function ($join) use ($student) {
                $join->on('tugas.id', '=', 'pengumpulan_tugas.id_tugas')
                    ->where('pengumpulan_tugas.id_siswa', '=', $student->id);
            })
            ->whereIn('tugas.id_mata_pelajaran', $enrolledSubjectIds)
            ->where('tugas.status', 'published')
            ->select([
                'tugas.id',
                'tugas.judul as title',
                'tugas.deskripsi as description',
                'tugas.tenggat_waktu as due_date',
                'tugas.skor_maksimal as max_score',
                'tugas.tipe_berkas_diizinkan as allowed_file_types',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.kode as subject_code',
                'pengumpulan_tugas.id as submission_id',
                'pengumpulan_tugas.status as submission_status',
                'pengumpulan_tugas.skor as score',
                'pengumpulan_tugas.dikumpulkan_pada as submitted_at',
            ]);

        $assignments = $assignmentsQuery->orderBy('tugas.tenggat_waktu', 'asc')->get();

        $assignmentsData = $assignments->map(function ($a) {
            $allowed = is_string($a->allowed_file_types) ? json_decode($a->allowed_file_types, true) : ($a->allowed_file_types ?? ['image', 'pdf']);

            return [
                'id' => $a->id,
                'title' => $a->title,
                'description' => $a->description,
                'due_date' => $a->due_date,
                'max_score' => $a->max_score,
                'allowed_file_types' => $allowed,
                'subject_title' => $a->subject_title,
                'subject_code' => $a->subject_code,
                'submission_id' => $a->submission_id,
                'submission_status' => $a->submission_status ?? 'pending',
                'score' => $a->score,
                'submitted_at' => $a->submitted_at,
            ];
        });

        return Inertia::render('Student/Assignments/index', [
            'assignments' => $assignmentsData,
        ]);
    }

    /**
     * Show assignment detail & submission page.
     */
    public function showAssignment(Assignment $assignment)
    {
        $student = $this->getStudentOrAbort();

        if (! $this->enrollmentService->checkEnrollment($student->id, $assignment->id_mata_pelajaran)) {
            abort(403, 'Anda belum terdaftar pada mata pelajaran tugas ini.');
        }

        $subject = $this->subjectService->getSubjectById($assignment->id_mata_pelajaran);

        $submission = DB::table('pengumpulan_tugas')
            ->where('id_tugas', $assignment->id)
            ->where('id_siswa', $student->id)
            ->first();

        $submissionFiles = [];
        if ($submission) {
            $submissionFiles = DB::table('berkas_pengumpulan_tugas')
                ->where('id_pengumpulan_tugas', $submission->id)
                ->get()
                ->map(function ($f) {
                    // Disesuaikan dengan nama kolom 'jalur_berkas' di migrasi
                    $path = $f->jalur_berkas ?? '';

                    return [
                        'id' => $f->id,
                        'file_path' => $path ? (str_starts_with($path, 'storage/') ? '/'.$path : '/storage/'.$path) : '',
                        'file_name' => $f->nama_berkas,
                        'file_type' => $f->tipe_berkas,
                        'file_size' => $f->ukuran_berkas,
                    ];
                });
        }

        $allowedTypes = is_string($assignment->tipe_berkas_diizinkan)
            ? json_decode($assignment->tipe_berkas_diizinkan, true)
            : ($assignment->tipe_berkas_diizinkan ?? ['image', 'pdf']);

        return Inertia::render('Student/Assignments/show', [
            'subject' => $subject,
            'assignment' => [
                'id' => $assignment->id,
                'title' => $assignment->judul,
                'description' => $assignment->deskripsi,
                'due_date' => $assignment->tenggat_waktu,
                'max_score' => $assignment->skor_maksimal,
                'allowed_file_types' => $allowedTypes,
            ],
            'submission' => $submission ? [
                'id' => $submission->id,
                'status' => $submission->status,
                'notes' => $submission->catatan, // Disesuaikan dengan kolom 'catatan'
                'score' => $submission->skor,
                'feedback' => $submission->umpan_balik, // Disesuaikan dengan kolom 'umpan_balik'
                'submitted_at' => $submission->dikumpulkan_pada,
                'files' => $submissionFiles,
            ] : null,
        ]);
    }

    /**
     * Submit assignment files (bulk images & PDF).
     */
    public function submitAssignment(Request $request, Assignment $assignment)
    {
        $student = $this->getStudentOrAbort();

        $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
            'files' => ['required', 'array', 'min:1'],
            'files.*' => ['required', 'file', 'mimes:jpeg,png,jpg,pdf', 'max:10240'],
        ]);

        $this->assignmentService->submitAssignment(
            $assignment->id,
            $student->id,
            $request->input('notes'),
            $request->file('files')
        );

        return redirect()->back()->with('success', 'Tugas berhasil dikumpulkan!');
    }

    /**
     * Student Profile Edit page.
     */
    public function profile()
    {
        $student = $this->getStudentOrAbort();
        $user = auth()->user();

        $classroom = null;
        $classEnrollment = DB::table('anggota_kelas')
            ->where('id_siswa', $student->id)
            ->where('status', 'aktif')
            ->first();

        if ($classEnrollment?->id_kelas) {
            $classroom = DB::table('kelas')
                ->leftJoin('jurusan', 'kelas.id_jurusan', '=', 'jurusan.id')
                ->where('kelas.id', $classEnrollment->id_kelas)
                ->select([
                    'kelas.id',
                    'kelas.nama_kelas as name',
                    'kelas.tingkat as grade',
                    'jurusan.nama_jurusan as major_name',
                    'jurusan.kode_jurusan as major_code',
                ])
                ->first();
        }

        return Inertia::render('Student/Profile/edit', [
            'student' => [
                'id' => $student->id,
                'nisn' => $student->nisn,
                'address' => $student->address,
                'photo' => $student->photo ? (str_starts_with($student->photo, 'storage/') ? '/'.$student->photo : '/storage/'.$student->photo) : null,
                'name' => $user->nama,
                'email' => $user->email,
                'classroom' => $classroom,
            ],
        ]);
    }

    /**
     * Update Student Profile and Avatar Photo.
     */
    public function updateProfile(Request $request)
    {
        $student = $this->getStudentOrAbort();
        $user = auth()->user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nisn' => ['required', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        $updateData = [
            'name' => $request->input('name'),
            'nisn' => $request->input('nisn'),
            'address' => $request->input('address'),
        ];

        if ($request->hasFile('photo')) {
            $updateData['photo'] = $request->file('photo');
        }

        $this->studentService->updateStudent($student->id, $updateData);

        return redirect()->back()->with('success', 'Profil Anda berhasil diperbarui!');
    }

    /**
     * Exams list for student.
     */
    public function exams(Request $request)
    {
        $student = $this->getStudentOrAbort();

        $enrolledSubjectIds = DB::table('pendaftaran')
            ->where('id_siswa', $student->id)
            ->pluck('id_mata_pelajaran')
            ->toArray();

        $exams = DB::table('ujian')
            ->join('mata_pelajaran', 'ujian.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->whereIn('ujian.id_mata_pelajaran', $enrolledSubjectIds)
            ->where('ujian.status', 'published')
            ->select([
                'ujian.id',
                'ujian.judul as title',
                'ujian.deskripsi as description',
                'ujian.durasi as duration',
                'ujian.nilai_kkm as pass_score',
                'ujian.waktu_mulai as start_time',
                'ujian.waktu_selesai as end_time',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.kode as subject_code',
            ])
            ->orderBy('ujian.created_at', 'desc')
            ->get();

        $examsData = $exams->map(function ($e) use ($student) {
            $session = DB::table('sesi_ujian')
                ->where('id_ujian', $e->id)
                ->where('id_siswa', $student->id)
                ->first();

            $totalQuestions = DB::table('soal')->where('id_ujian', $e->id)->count();

            return [
                'id' => $e->id,
                'title' => $e->title,
                'description' => $e->description,
                'duration' => $e->duration,
                'pass_score' => $e->pass_score,
                'start_time' => $e->start_time,
                'end_time' => $e->end_time,
                'subject_title' => $e->subject_title,
                'subject_code' => $e->subject_code,
                'total_questions' => $totalQuestions,
                'student_session' => $session ? [
                    'id' => $session->id,
                    'status' => $session->status,
                    'total_score' => $session->total_skor,
                ] : null,
            ];
        });

        return Inertia::render('Student/Exams/index', [
            'exams' => $examsData,
        ]);
    }

    public function showExam(Exam $exam)
    {
        $student = $this->getStudentOrAbort();

        if (! $this->enrollmentService->checkEnrollment($student->id, $exam->id_mata_pelajaran)) {
            abort(403, 'Anda belum terdaftar pada mata pelajaran ujian ini.');
        }

        $subject = $this->subjectService->getSubjectById($exam->id_mata_pelajaran);

        $session = DB::table('sesi_ujian')
            ->where('id_ujian', $exam->id)
            ->where('id_siswa', $student->id)
            ->first();

        return Inertia::render('Student/Exams/show', [
            'subject' => $subject,
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->judul,
                'description' => $exam->deskripsi,
                'duration' => $exam->durasi,
                'pass_score' => $exam->nilai_kkm,
                'start_time' => $exam->waktu_mulai,
                'end_time' => $exam->waktu_selesai,
                'total_questions' => DB::table('soal')->where('id_ujian', $exam->id)->count(),
                'session' => $session ? [
                    'id' => $session->id,
                    'status' => $session->status,
                    'is_submitted' => $session->status === 'submitted',
                ] : null,
            ],
        ]);
    }

    /**
     * Start or resume exam session.
     */
    public function startExam(Exam $exam)
    {
        $student = $this->getStudentOrAbort();

        $payload = $this->examService->startOrResumeExamSession($exam->id, $student->id);

        return redirect()->route('student.exams.session', $payload['session']->id);
    }

    /**
     * Show Secure Web Exam Session Interface.
     */
    public function showExamSession(string $sessionId)
    {
        $student = $this->getStudentOrAbort();

        $sessionData = $this->examService->getExamSessionState($sessionId, $student->id);
        $exam = $this->examService->findExam($sessionData['session']->exam_id);
        $subject = $this->subjectService->getSubjectById($exam->subject_id);

        return Inertia::render('Student/Exams/session', [
            'subject' => $subject,
            'exam' => [
                'id' => $exam->id,
                'title' => $exam->title,
                'duration' => $exam->duration,
                'pass_score' => $exam->pass_score,
            ],
            'session' => $sessionData['session'],
            'questions' => $sessionData['questions'],
            'saved_answers' => $sessionData['saved_answers'],
            'saved_answers_list' => $sessionData['saved_answers_list'],
        ]);
    }

    /**
     * Real-time answer auto-save API/Web endpoint during active exam session.
     */
    public function saveExamAnswer(Request $request, string $sessionId)
    {
        $student = $this->getStudentOrAbort();

        $request->validate([
            'question_id' => ['required', 'string'],
            'selected_option_id' => ['nullable', 'string'],
            'essay_answer' => ['nullable', 'string'],
        ]);

        $this->examService->saveStudentAnswer(
            $sessionId,
            $student->id,
            $request->input('question_id'),
            $request->input('selected_option_id'),
            $request->input('essay_answer')
        );

        return response()->json(['success' => true, 'message' => 'Jawaban berhasil disimpan.']);
    }

    /**
     * Submit Exam Session.
     */
    public function submitExamSession(string $sessionId)
    {
        $student = $this->getStudentOrAbort();

        $res = $this->examService->submitExamSession($sessionId, $student->id);

        return redirect()->route('student.exams.result', $sessionId)
            ->with('success', 'Ujian telah berhasil dikumpulkan.');
    }

    /**
     * Show Exam Result Breakdown Page.
     */
    public function showExamResult(string $sessionId)
    {
        $student = $this->getStudentOrAbort();

        $result = $this->examService->getExamResultDetails($sessionId, $student->id);

        return Inertia::render('Student/Exams/result', [
            'result' => $result,
        ]);
    }
}
