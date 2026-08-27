<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ClassroomService;
use App\Services\MajorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MajorController extends Controller
{
    public function __construct(
        protected MajorService $majorService,
        protected ClassroomService $classroomService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'major_id', 'grade', 'academic_year', 'sort', 'direction']);
        $majors = $this->majorService->getPaginatedMajors(['search' => $request->get('search')], 10);
        $allMajors = $this->majorService->getAllMajors();
        $classrooms = $this->classroomService->getPaginatedClassrooms($filters, 10);

        return Inertia::render('Admin/Majors/index', [
            'majors' => $majors,
            'allMajors' => $allMajors,
            'classrooms' => $classrooms,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_jurusan' => 'required|string|max:10|unique:jurusan,kode_jurusan',
            'nama_jurusan' => 'required|string|max:255',
        ], [
            'kode_jurusan.required' => 'Kode jurusan wajib diisi.',
            'kode_jurusan.unique' => 'Kode jurusan sudah terdaftar.',
            'nama_jurusan.required' => 'Nama jurusan wajib diisi.',
        ]);

        $this->majorService->createMajor($validated);

        return redirect()->route('admin.majors.index')
            ->with('success', 'Data jurusan baru berhasil ditambahkan.');
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'kode_jurusan' => 'required|string|max:10|unique:jurusan,kode_jurusan,'.$id,
            'nama_jurusan' => 'required|string|max:255',
        ], [
            'kode_jurusan.required' => 'Kode jurusan wajib diisi.',
            'kode_jurusan.unique' => 'Kode jurusan sudah terdaftar.',
            'nama_jurusan.required' => 'Nama jurusan wajib diisi.',
        ]);

        $this->majorService->updateMajor($id, $validated);

        return redirect()->route('admin.majors.index')
            ->with('success', 'Data jurusan berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $this->majorService->deleteMajor($id);

        return redirect()->route('admin.majors.index')
            ->with('success', 'Data jurusan berhasil dihapus.');
    }
}
