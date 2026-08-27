<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ClassEnrollmentService;
use App\Services\ClassroomService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassEnrollmentController extends Controller
{
    public function __construct(
        protected ClassEnrollmentService $classEnrollmentService,
        protected ClassroomService $classroomService
    ) {}

    public function index(Request $request, string $classroomId)
    {
        $classroom = $this->classroomService->getClassroomById($classroomId);
        if (! $classroom) {
            abort(404);
        }

        $filters = $request->only(['search', 'status']);
        $students = $this->classEnrollmentService->getStudentsInClassroom($classroomId, $filters, 15);
        $unassignedStudents = $this->classEnrollmentService->getUnassignedStudents(['search' => $request->get('unassigned_search')], 15);

        return Inertia::render('Admin/Classrooms/students', [
            'classroom' => $classroom,
            'students' => $students,
            'unassignedStudents' => $unassignedStudents,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request, string $classroomId)
    {
        $validated = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'exists:siswa,id',
        ], [
            'student_ids.required' => 'Pilih minimal satu siswa untuk dimasukkan ke dalam kelas.',
        ]);

        $this->classEnrollmentService->assignStudentsToClassroom($classroomId, $validated['student_ids']);

        return redirect()->route('admin.classrooms.students.index', $classroomId)
            ->with('success', 'Siswa berhasil dimasukkan ke dalam kelas.');
    }

    public function updateStatus(Request $request, string $classroomId, string $studentId)
    {
        $validated = $request->validate([
            'status' => 'required|in:aktif,pindah,lulus',
        ]);

        $this->classEnrollmentService->updateEnrollmentStatus($classroomId, $studentId, $validated['status']);

        return redirect()->route('admin.classrooms.students.index', $classroomId)
            ->with('success', 'Status anggota kelas berhasil diperbarui.');
    }

    public function destroy(string $classroomId, string $studentId)
    {
        $this->classEnrollmentService->removeStudentFromClassroom($classroomId, $studentId);

        return redirect()->route('admin.classrooms.students.index', $classroomId)
            ->with('success', 'Siswa berhasil dikeluarkan dari kelas.');
    }
}
