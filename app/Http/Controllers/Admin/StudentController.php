<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Student\StoreStudentRequest;
use App\Http\Requests\Admin\Student\UpdateStudentRequest;
use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class StudentController extends Controller
{
    protected StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index()
    {
        Gate::authorize('viewAny', Student::class);

        $filters = request()->only(['search', 'sort', 'direction']);
        $students = $this->studentService->getStudentList($filters);

        return Inertia::render('Admin/Students/index', [
            'students' => $students,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Student::class);

        $filters = request()->only(['search']);
        $assignableUsers = $this->studentService->getAssignableUsers($filters, 10);

        return Inertia::render('Admin/Students/create', [
            'assignableUsers' => $assignableUsers,
            'filters' => $filters,
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $data = $request->validated();

        $this->studentService->createStudent($data);

        return redirect()->route('admin.students.index')
            ->with('success', 'Berhasil! Profil siswa baru telah dibuat dan akun user sudah terhubung.');
    }

    public function show(Student $student)
    {
        Gate::authorize('view', $student);

        $student = $this->studentService->findStudent($student->id);

        return Inertia::render('Admin/Students/show', [
            'student' => $student,
        ]);
    }

    public function edit(Student $student)
    {
        Gate::authorize('update', $student);

        $student = $this->studentService->findStudent($student->id);

        return Inertia::render('Admin/Students/edit', [
            'student' => $student,
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student)
    {
        $data = $request->validated();

        $this->studentService->updateByAdmin($data, $student->id);

        return redirect()->route('admin.students.index')
            ->with('success', 'Data profil siswa telah berhasil diperbarui.');
    }

    public function destroy(Student $student)
    {
        Gate::authorize('delete', $student);

        $this->studentService->deleteStudent($student->id);

        return redirect()->route('admin.students.index')
            ->with('success', 'Data profil siswa telah berhasil dihapus.');
    }
}
