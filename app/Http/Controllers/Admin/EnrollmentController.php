<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Illuminate\Http\Request;
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

            $enrollments = $this->enrollmentService->getEnrollmentList($filters, 15);

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
