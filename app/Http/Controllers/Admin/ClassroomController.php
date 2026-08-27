<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ClassroomService;
use App\Services\MajorService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClassroomController extends Controller
{
    public function __construct(
        protected ClassroomService $classroomService,
        protected MajorService $majorService
    ) {}

    public function index(Request $request)
    {
        return redirect()->route('admin.majors.index', $request->all());
    }

    public function create()
    {
        $majors = $this->majorService->getAllMajors();
        $teachers = $this->classroomService->getAvailableHomeroomTeachers();

        return Inertia::render('Admin/Classrooms/create', [
            'majors' => $majors,
            'teachers' => $teachers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_jurusan' => 'required|exists:jurusan,id',
            'id_wali_kelas' => 'nullable|exists:guru,id',
            'tingkat' => 'required|in:10,11,12',
            'rombel' => [
                'required',
                'string',
                'max:5',
                Rule::unique('kelas', 'rombel')->where(function ($query) use ($request) {
                    return $query->where('id_jurusan', $request->id_jurusan)
                        ->where('tingkat', $request->tingkat)
                        ->where('tahun_ajaran', $request->tahun_ajaran);
                }),
            ],
            'nama_kelas' => 'nullable|string|max:255',
            'tahun_ajaran' => 'required|string|max:9',
        ], [
            'id_jurusan.required' => 'Jurusan wajib dipilih.',
            'tingkat.required' => 'Tingkat kelas wajib dipilih.',
            'rombel.required' => 'Rombel kelas wajib diisi.',
            'rombel.unique' => 'Rombel kelas ini (Jurusan, Tingkat, Rombel, dan Tahun Ajaran) sudah terdaftar.',
            'tahun_ajaran.required' => 'Tahun ajaran wajib diisi.',
        ]);

        $this->classroomService->createClassroom($validated);

        return redirect()->route('admin.majors.index')
            ->with('success', 'Data rombel/kelas baru berhasil ditambahkan.');
    }

    public function show(string $id)
    {
        $classroom = $this->classroomService->getClassroomById($id);
        if (! $classroom) {
            abort(404);
        }

        return redirect()->route('admin.classrooms.students.index', $id);
    }

    public function edit(string $id)
    {
        $classroom = $this->classroomService->getClassroomById($id);
        if (! $classroom) {
            abort(404);
        }

        $majors = $this->majorService->getAllMajors();
        $teachers = $this->classroomService->getAvailableHomeroomTeachers($classroom->homeroom_teacher_id);

        return Inertia::render('Admin/Classrooms/edit', [
            'classroom' => $classroom,
            'majors' => $majors,
            'teachers' => $teachers,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'id_jurusan' => 'required|exists:jurusan,id',
            'id_wali_kelas' => 'nullable|exists:guru,id',
            'tingkat' => 'required|in:10,11,12',
            'rombel' => [
                'required',
                'string',
                'max:5',
                Rule::unique('kelas', 'rombel')->where(function ($query) use ($request) {
                    return $query->where('id_jurusan', $request->id_jurusan)
                        ->where('tingkat', $request->tingkat)
                        ->where('tahun_ajaran', $request->tahun_ajaran);
                })->ignore($id),
            ],
            'nama_kelas' => 'nullable|string|max:255',
            'tahun_ajaran' => 'required|string|max:9',
        ], [
            'id_jurusan.required' => 'Jurusan wajib dipilih.',
            'tingkat.required' => 'Tingkat kelas wajib dipilih.',
            'rombel.required' => 'Rombel kelas wajib diisi.',
            'rombel.unique' => 'Rombel kelas ini (Jurusan, Tingkat, Rombel, dan Tahun Ajaran) sudah terdaftar.',
            'tahun_ajaran.required' => 'Tahun ajaran wajib diisi.',
        ]);

        $this->classroomService->updateClassroom($id, $validated);

        return redirect()->route('admin.majors.index')
            ->with('success', 'Data rombel/kelas berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        $this->classroomService->deleteClassroom($id);

        return redirect()->route('admin.majors.index')
            ->with('success', 'Data rombel/kelas berhasil dihapus.');
    }
}
