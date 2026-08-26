<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Teacher\StoreTeacherRequest as AdminStoreTeacherRequest;
use App\Http\Requests\Admin\Teacher\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Services\TeacherService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TeacherController extends Controller
{
    protected TeacherService $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction']);
        $teachers = $this->teacherService->getTeacherList($filters);

        return Inertia::render('Admin/Teachers/index', [
            'teachers' => $teachers,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $filters = request()->only(['search']);
        $assignableUsers = $this->teacherService->getAssignableUsers($filters, 10);

        return Inertia::render('Admin/Teachers/create', [
            'assignableUsers' => $assignableUsers,
            'filters' => $filters,
        ]);
    }

    public function store(AdminStoreTeacherRequest $request)
    {
        $data = $request->validated();

        try {
            $this->teacherService->createTeacher($data);

            return redirect()->route('admin.teachers.index')
                ->with('success', 'Berhasil! Profil guru baru telah dibuat dan akun user sudah terhubung.');
        } catch (Exception $e) {
            Log::error('Error creating teacher profile by admin: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat membuat profil guru. Silakan coba lagi.');
        }
    }

    public function show(Teacher $teacher)
    {
        $teacher = $this->teacherService->findTeacher($teacher->id);

        return Inertia::render('Admin/Teachers/show', [
            'teacher' => $teacher,
        ]);
    }

    public function edit(Teacher $teacher)
    {
        $teacher = $this->teacherService->findTeacher($teacher->id);

        return Inertia::render('Admin/Teachers/edit', [
            'teacher' => $teacher,
        ]);
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $data = $request->validated();

        try {
            $this->teacherService->updateByAdmin($data, $teacher->id);

            return redirect()->route('admin.teachers.index')
                ->with('success', 'Data profil guru telah berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Error updating teacher profile by admin: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui profil guru. Silakan coba lagi.');
        }

    }

    public function destroy(Teacher $teacher)
    {
        Gate::authorize('delete', $teacher);

        try {
            $this->teacherService->deleteTeacher($teacher->id);

            return redirect()->route('admin.teachers.index')
                ->with('success', 'Data profil guru telah berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Error deleting teacher profile by admin: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus profil guru. Silakan coba lagi.');
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        try {
            $result = $this->teacherService->importTeachersFromCsv($request->file('file'));

            $message = "Import selesai! {$result['imported']} data guru berhasil ditambahkan.";
            if ($result['skipped'] > 0) {
                $message .= " ({$result['skipped']} data dilewati).";
            }

            return redirect()->route('admin.teachers.index')
                ->with('success', $message);
        } catch (Exception $e) {
            Log::error('Error importing teachers CSV: '.$e->getMessage());

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    public function downloadTemplate()
    {
        $csvHeader = "nip,nama,email,spesialisasi,bio\n";
        $csvContent = $csvHeader."199001012022011001,Drs. Budi Santoso,budi@example.com,Teknik Komputer dan Jaringan,Guru Senior TKJ\n199203152022012002,Siti Rahma S.Pd,siti@example.com,Rekayasa Perangkat Lunak,Guru Pemrograman\n";

        return response($csvContent, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_import_guru.csv"',
        ]);
    }
}
