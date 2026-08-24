<?php

namespace App\Http\Controllers;

use App\Services\EnrollmentService;
use App\Services\MaterialService;
use App\Services\StudentService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use App\Services\UserService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected TeacherService $teacherService,
        protected StudentService $studentService,
        protected SubjectService $subjectService,
        protected MaterialService $materialService,
        protected EnrollmentService $enrollmentService
    ) {}

    public function index()
    {
        $user = auth()->user();
        $data = [];

        if ($user->role === 'admin') {
            $data = $this->getAdminDashboardData();
        } elseif ($user->role === 'guru') {
            $data = $this->getTeacherDashboardData($user);
        } elseif ($user->role === 'siswa') {
            $data = $this->getStudentDashboardData($user);
        }

        return Inertia::render('dashboard', $data);
    }

    protected function getAdminDashboardData(): array
    {
        return [
            'stats' => [
                'total_students' => DB::table('pengguna')->where('peran', 'siswa')->where('disetujui', true)->count(),
                'total_teachers' => DB::table('pengguna')->where('peran', 'guru')->count(),
                'total_subjects' => DB::table('mata_pelajaran')->count(),
                'total_materials' => DB::table('materi')->count(),
            ],
            'pending_users' => DB::table('pengguna')
                ->where('disetujui', false)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->nama,
                    'email' => $user->email,
                    'role' => $user->peran,
                    'date' => $user->created_at,
                ]),
            'subject_progress' => DB::table('mata_pelajaran')
                ->join('pendaftaran', 'mata_pelajaran.id', '=', 'pendaftaran.id_mata_pelajaran')
                ->select('mata_pelajaran.judul as name')
                ->selectRaw('count(pendaftaran.id) as count')
                ->groupBy('mata_pelajaran.id', 'mata_pelajaran.judul')
                ->orderBy('count', 'desc')
                ->limit(4)
                ->get()
                ->map(fn ($item) => [
                    'name' => $item->name,
                    'count' => (int) $item->count,
                    'total' => DB::table('pengguna')->where('peran', 'siswa')->where('disetujui', true)->count(),
                ]),
        ];
    }

    protected function getTeacherDashboardData($user): array
    {
        $teacher = $this->teacherService->getTeacherByUserId($user->id);
        $teacherId = $teacher?->id;

        $subjectIds = DB::table('mata_pelajaran')->where('id_guru', $teacherId)->pluck('id');

        return [
            'stats' => [
                'total_students' => DB::table('pendaftaran')->whereIn('id_mata_pelajaran', $subjectIds)->distinct('id_siswa')->count(),
                'total_subjects' => count($subjectIds),
                'total_materials' => DB::table('materi')->whereIn('id_mata_pelajaran', $subjectIds)->count(),
                'total_enrollments' => DB::table('pendaftaran')->whereIn('id_mata_pelajaran', $subjectIds)->count(),
            ],
            'recent_enrollments' => DB::table('pendaftaran')
                ->join('siswa', 'pendaftaran.id_siswa', '=', 'siswa.id')
                ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
                ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
                ->whereIn('pendaftaran.id_mata_pelajaran', $subjectIds)
                ->select([
                    'pengguna.nama as student_name',
                    'pengguna.email as student_email',
                    'mata_pelajaran.judul as subject_title',
                    'pendaftaran.terdaftar_pada as date',
                ])
                ->orderBy('pendaftaran.terdaftar_pada', 'desc')
                ->limit(5)
                ->get(),
            'subject_progress' => DB::table('mata_pelajaran')
                ->where('id_guru', $teacherId)
                ->select('id', 'judul as name')
                ->get()
                ->map(function ($subject) {
                    $enrollmentIds = DB::table('pendaftaran')->where('id_mata_pelajaran', $subject->id)->pluck('id');
                    $totalMaterials = DB::table('materi')->where('id_mata_pelajaran', $subject->id)->count();

                    if (count($enrollmentIds) === 0 || $totalMaterials === 0) {
                        return [
                            'name' => $subject->name,
                            'count' => 0,
                            'total' => $totalMaterials ?: 1,
                            'percentage' => 0,
                        ];
                    }

                    $completedCount = DB::table('progres_siswa')
                        ->whereIn('id_pendaftaran', $enrollmentIds)
                        ->where('selesai', true)
                        ->count();

                    $totalPossibleCompletions = count($enrollmentIds) * $totalMaterials;
                    $percentage = round(($completedCount / $totalPossibleCompletions) * 100);

                    return [
                        'name' => $subject->name,
                        'count' => $completedCount,
                        'total' => $totalPossibleCompletions,
                        'percentage' => $percentage,
                    ];
                })
                ->sortByDesc('percentage')
                ->take(4)
                ->values()
                ->toArray(),
        ];
    }

    public function pending()
    {
        return Inertia::render('pending');
    }

    public function unauthorized()
    {
        return Inertia::render('unauthorized');
    }

    protected function getStudentDashboardData($user): array
    {
        $student = DB::table('siswa')->where('id_pengguna', $user->id)->first();
        $studentId = $student?->id;

        if (! $studentId) {
            return [
                'stats' => [
                    'enrolled_subjects' => 0,
                    'completed_materials' => 0,
                    'available_exams' => 0,
                    'pending_assignments' => 0,
                ],
                'enrolled_subjects_list' => [],
            ];
        }

        $enrollments = DB::table('pendaftaran')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->leftJoin('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->leftJoin('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->where('pendaftaran.id_siswa', $studentId)
            ->select([
                'pendaftaran.id as enrollment_id',
                'mata_pelajaran.id as subject_id',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.kode as subject_code',
                'pengguna.nama as teacher_name',
                'pendaftaran.terdaftar_pada as enrolled_at',
            ])
            ->get();

        $enrolledSubjectIds = $enrollments->pluck('subject_id')->toArray();
        $enrollmentIds = $enrollments->pluck('enrollment_id')->toArray();

        $completedMaterialsCount = DB::table('progres_siswa')
            ->whereIn('id_pendaftaran', $enrollmentIds)
            ->where('selesai', true)
            ->count();

        $availableExamsCount = DB::table('ujian')
            ->whereIn('id_mata_pelajaran', $enrolledSubjectIds)
            ->where('status', 'published')
            ->count();

        $submittedAssignmentIds = DB::table('pengumpulan_tugas')
            ->where('id_siswa', $studentId)
            ->pluck('id_tugas')
            ->toArray();

        $pendingAssignmentsCount = DB::table('tugas')
            ->whereIn('id_mata_pelajaran', $enrolledSubjectIds)
            ->where('status', 'published')
            ->whereNotIn('id', $submittedAssignmentIds)
            ->count();

        $enrolledSubjectsList = $enrollments->map(function ($item) {
            $totalMaterials = DB::table('materi')->where('id_mata_pelajaran', $item->subject_id)->count();
            $completedMaterials = DB::table('progres_siswa')
                ->where('id_pendaftaran', $item->enrollment_id)
                ->where('selesai', true)
                ->count();

            $percentage = $totalMaterials > 0 ? (int) round(($completedMaterials / $totalMaterials) * 100) : 0;

            return [
                'id' => $item->subject_id,
                'title' => $item->subject_title,
                'code' => $item->subject_code,
                'teacher_name' => $item->teacher_name ?? 'Pengajar',
                'total_materials' => $totalMaterials,
                'completed_materials' => $completedMaterials,
                'percentage' => $percentage,
            ];
        })->toArray();

        return [
            'stats' => [
                'enrolled_subjects' => count($enrollments),
                'completed_materials' => $completedMaterialsCount,
                'available_exams' => $availableExamsCount,
                'pending_assignments' => $pendingAssignmentsCount,
            ],
            'enrolled_subjects_list' => $enrolledSubjectsList,
        ];
    }
}
