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
                'total_students' => DB::table('users')->where('role', 'siswa')->where('is_approved', true)->count(),
                'total_teachers' => DB::table('users')->where('role', 'guru')->count(),
                'total_subjects' => DB::table('subjects')->count(),
                'total_materials' => DB::table('materials')->count(),
            ],
            'pending_users' => DB::table('users')
                ->where('is_approved', false)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'date' => $user->created_at,
                ]),
            'subject_progress' => DB::table('subjects')
                ->join('enrollments', 'subjects.id', '=', 'enrollments.subject_id')
                ->select('subjects.title as name')
                ->selectRaw('count(enrollments.id) as count')
                ->groupBy('subjects.id', 'subjects.title')
                ->orderBy('count', 'desc')
                ->limit(4)
                ->get()
                ->map(fn ($item) => [
                    'name' => $item->name,
                    'count' => (int) $item->count,
                    'total' => DB::table('users')->where('role', 'siswa')->where('is_approved', true)->count(),
                ]),
        ];
    }

    protected function getTeacherDashboardData($user): array
    {
        $teacher = $this->teacherService->getTeacherByUserId($user->id);
        $teacherId = $teacher?->id;

        $subjectIds = DB::table('subjects')->where('teacher_id', $teacherId)->pluck('id');

        return [
            'stats' => [
                'total_students' => DB::table('enrollments')->whereIn('subject_id', $subjectIds)->distinct('student_id')->count(),
                'total_subjects' => count($subjectIds),
                'total_materials' => DB::table('materials')->whereIn('subject_id', $subjectIds)->count(),
                'total_enrollments' => DB::table('enrollments')->whereIn('subject_id', $subjectIds)->count(),
            ],
            'recent_enrollments' => DB::table('enrollments')
                ->join('students', 'enrollments.student_id', '=', 'students.id')
                ->join('users', 'students.user_id', '=', 'users.id')
                ->join('subjects', 'enrollments.subject_id', '=', 'subjects.id')
                ->whereIn('enrollments.subject_id', $subjectIds)
                ->select([
                    'users.name as student_name',
                    'users.email as student_email',
                    'subjects.title as subject_title',
                    'enrollments.enrolled_at as date',
                ])
                ->orderBy('enrollments.enrolled_at', 'desc')
                ->limit(5)
                ->get(),
            'subject_progress' => DB::table('subjects')
                ->where('teacher_id', $teacherId)
                ->select('id', 'title as name')
                ->get()
                ->map(function ($subject) {
                    $enrollmentIds = DB::table('enrollments')->where('subject_id', $subject->id)->pluck('id');
                    $totalMaterials = DB::table('materials')->where('subject_id', $subject->id)->count();
                    
                    if (count($enrollmentIds) === 0 || $totalMaterials === 0) {
                        return [
                            'name' => $subject->name,
                            'count' => 0,
                            'total' => $totalMaterials ?: 1,
                            'percentage' => 0
                        ];
                    }

                    $completedCount = DB::table('student_progress')
                        ->whereIn('enrollment_id', $enrollmentIds)
                        ->where('is_completed', true)
                        ->count();
                    
                    $totalPossibleCompletions = count($enrollmentIds) * $totalMaterials;
                    $percentage = round(($completedCount / $totalPossibleCompletions) * 100);

                    return [
                        'name' => $subject->name,
                        'count' => $completedCount,
                        'total' => $totalPossibleCompletions,
                        'percentage' => $percentage
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
