<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Student\StoreStudentRequest;
use App\Http\Requests\Admin\Student\UpdateStudentRequest;
use App\Models\Student;
use App\Services\StudentService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
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

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:text/csv,text/plain,application/csv,text/comma-separated-values,application/excel,application/vnd.ms-excel', 'max:5120'],
        ], [
            'file.required' => 'Berkas CSV wajib diunggah.',
            'file.mimetypes' => 'Berkas harus berupa file CSV valid.',
            'file.max' => 'Ukuran berkas maksimal adalah 5MB.',
        ]);

        try {
            $result = $this->studentService->importStudentsFromCsv($request->file('file'));

            $msg = "Berhasil mengimpor {$result['imported']} siswa.";
            if ($result['skipped_count'] > 0) {
                $msg .= " ({$result['skipped_count']} data gagal/dilewati).";
            }

            return redirect()->back()->with([
                'success' => $msg,
                'import_errors' => $result['skipped_items'] ?? [],
            ]);
        } catch (Exception $e) {
            Log::error('Error importing students CSV: '.$e->getMessage());

            return redirect()->back()->with('error', 'Gagal mengimpor file: '.$e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $csvHeader = "nama,email,nisn,alamat,kelas\n";
        $csvExample = "Ahmad Rizky,ahmad.rizky@example.com,0051234567,Jl. Sudirman No. 12,X TKJ 1\nSiti Aminah,siti.aminah@example.com,0051234568,Jl. Merdeka No. 45,X RPL AB\n";

        return response($csvHeader.$csvExample, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_import_siswa.csv"',
        ]);
    }
}
