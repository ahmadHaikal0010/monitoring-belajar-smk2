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
}
