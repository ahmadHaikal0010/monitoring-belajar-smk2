<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    protected EnrollmentService $enrollmentService;

    protected TeacherService $teacherService;

    protected SubjectService $subjectService;

    public function __construct(
        EnrollmentService $enrollmentService,
        TeacherService $teacherService,
        SubjectService $subjectService
    ) {
        $this->enrollmentService = $enrollmentService;
        $this->teacherService = $teacherService;
        $this->subjectService = $subjectService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $request->only(['search', 'sort', 'direction', 'status', 'subject_id']);

        // Jika Guru, filter hanya data di mata pelajaran mereka
        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            $filters['teacher_id'] = $teacher?->id;
        }

        // TAMPILAN 1: Jika memilih subjek tertentu
        if (! empty($filters['subject_id'])) {
            $selectedSubject = $this->subjectService->getSubjectById($filters['subject_id']);

            // Keamanan: Guru hanya boleh melihat subjek miliknya
            if ($user->role === 'guru' && ($selectedSubject->teacher_id ?? null) !== ($filters['teacher_id'] ?? null)) {
                abort(403, 'Anda tidak memiliki hak akses untuk mata pelajaran ini.');
            }

            $enrollments = $this->enrollmentService->getEnrollmentListWithProgress($filters, 15);

            return Inertia::render('Admin/Enrollments/index', [
                'enrollments' => $enrollments,
                'selectedSubject' => $selectedSubject,
                'filters' => $filters,
                'mode' => 'enrollments',
            ]);
        }

        // TAMPILAN 2: Daftar Mata Pelajaran untuk dipilih
        $subjects = $this->subjectService->getSubjectList($filters, 12);

        return Inertia::render('Admin/Enrollments/index', [
            'subjects' => $subjects,
            'filters' => $filters,
            'mode' => 'subjects',
        ]);
    }

    public function progress(string $id)
    {
        $enrollment = $this->enrollmentService->getEnrollmentWithProgress($id);

        if (! $enrollment) {
            abort(404, 'Data pendaftaran tidak ditemukan.');
        }

        $user = auth()->user();
        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            if ($enrollment->teacher_id !== ($teacher->id ?? null)) {
                abort(403, 'Anda tidak memiliki hak akses untuk melihat progres ini.');
            }
        }

        $materials = $this->subjectService->getMaterialsBySubjectId($enrollment->subject_id);

        // Get specific completion status for each material
        $completedMaterialIds = DB::table('progres_siswa')
            ->where('id_pendaftaran', $id)
            ->where('selesai', true)
            ->pluck('id_materi')
            ->toArray();

        // Get exam results for this student in this subject
        $examResults = DB::table('ujian')
            ->leftJoin('sesi_ujian', function ($join) use ($enrollment) {
                $join->on('ujian.id', '=', 'sesi_ujian.id_ujian')
                    ->where('sesi_ujian.id_siswa', '=', $enrollment->student_id);
            })
            ->where('ujian.id_mata_pelajaran', $enrollment->subject_id)
            ->where('ujian.status', 'published')
            ->select([
                'ujian.id as exam_id',
                'ujian.judul as exam_title',
                'ujian.nilai_kkm as pass_score',
                'ujian.durasi as duration',
                'sesi_ujian.id as session_id',
                'sesi_ujian.status as session_status',
                'sesi_ujian.total_skor as total_score',
                'sesi_ujian.dikumpulkan_pada as submitted_at',
                'sesi_ujian.dimulai_pada as started_at',
            ])
            ->orderBy('ujian.created_at', 'asc')
            ->get()
            ->map(function ($item) {
                $item->is_passed = $item->total_score !== null ? ((float) $item->total_score >= (float) $item->pass_score) : null;

                return $item;
            });

        // Get assignment results for this student in this subject
        $assignmentResults = DB::table('tugas')
            ->leftJoin('pengumpulan_tugas', function ($join) use ($enrollment) {
                $join->on('tugas.id', '=', 'pengumpulan_tugas.id_tugas')
                    ->where('pengumpulan_tugas.id_siswa', '=', $enrollment->student_id);
            })
            ->where('tugas.id_mata_pelajaran', $enrollment->subject_id)
            ->where('tugas.status', 'published')
            ->select([
                'tugas.id as assignment_id',
                'tugas.judul as assignment_title',
                'tugas.skor_maksimal as max_score',
                'tugas.tenggat_waktu as due_date',
                'pengumpulan_tugas.id as submission_id',
                'pengumpulan_tugas.status as submission_status',
                'pengumpulan_tugas.skor as score',
                'pengumpulan_tugas.umpan_balik as feedback',
                'pengumpulan_tugas.dikumpulkan_pada as submitted_at',
            ])
            ->orderBy('tugas.created_at', 'asc')
            ->get();

        return Inertia::render('Admin/Enrollments/progress', [
            'enrollment' => $enrollment,
            'materials' => $materials,
            'completedMaterialIds' => $completedMaterialIds,
            'examResults' => $examResults,
            'assignmentResults' => $assignmentResults,
        ]);
    }

    public function destroy(string $id)
    {
        $enrollment = $this->enrollmentService->findEnrollment($id);

        if (! $enrollment) {
            abort(404, 'Data pendaftaran tidak ditemukan.');
        }

        $user = auth()->user();
        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            if ($enrollment->teacher_id !== ($teacher->id ?? null)) {
                abort(403, 'Anda tidak memiliki hak akses untuk menghapus pendaftaran ini.');
            }
        }

        $this->enrollmentService->deleteEnrollment($id);

        return redirect()->back()
            ->with('success', 'Pendaftaran siswa telah berhasil dihapus dari mata pelajaran.');
    }
}
