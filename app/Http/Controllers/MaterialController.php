<?php

namespace App\Http\Controllers;

use App\Http\Requests\Material\StoreMaterialRequest;
use App\Http\Requests\Material\UpdateMaterialRequest;
use App\Models\Material;
use App\Services\MaterialService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MaterialController extends Controller
{
    protected MaterialService $materialService;

    protected SubjectService $subjectService;

    protected TeacherService $teacherService;

    public function __construct(
        MaterialService $materialService,
        SubjectService $subjectService,
        TeacherService $teacherService
    ) {
        $this->materialService = $materialService;
        $this->subjectService = $subjectService;
        $this->teacherService = $teacherService;
    }

    /**
     * Display a listing of the resource (Redirects to unified Subjects index).
     */
    public function index()
    {
        return redirect()->route('teacher.subjects.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $subjectId = request('subject_id');
        $classroomId = request('classroom_id');

        if (! $subjectId) {
            return redirect()->route('teacher.materials.index')
                ->with('error', 'Silakan pilih mata pelajaran terlebih dahulu.');
        }

        $subject = $this->subjectService->getSubjectById($subjectId);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if (auth()->user()->role === 'guru' && $subject->teacher_id !== $teacher?->id) {
            return Inertia::render('unauthorized', [
                'message' => 'Anda tidak memiliki wewenang untuk menambahkan materi pada mata pelajaran ini.',
            ]);
        }

        $classrooms = DB::table('kelas_mata_pelajaran')
            ->join('kelas', 'kelas_mata_pelajaran.id_kelas', '=', 'kelas.id')
            ->where('kelas_mata_pelajaran.id_mata_pelajaran', $subjectId)
            ->select(['kelas.id', 'kelas.nama_kelas as name'])
            ->get();

        return Inertia::render('Materials/create', [
            'subject' => $subject,
            'classrooms' => $classrooms,
            'classroomId' => $classroomId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMaterialRequest $request)
    {
        $data = $request->validated();

        $subject = $this->subjectService->getSubjectById($data['subject_id']);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if (auth()->user()->role === 'guru' && $subject->teacher_id !== $teacher?->id) {
            abort(403, 'Tindakan tidak diizinkan.');
        }

        try {
            $this->materialService->createMaterial($data);

            if (! empty($data['classroom_id'])) {
                return redirect()->route('teacher.subjects.classrooms.materials', [$data['subject_id'], $data['classroom_id']])
                    ->with('success', 'Materi pembelajaran baru telah berhasil diterbitkan.');
            }

            return redirect()->route('teacher.subjects.show', $data['subject_id'])
                ->with('success', 'Materi pembelajaran baru telah berhasil diterbitkan.');
        } catch (Exception $e) {
            Log::error('Error creating material: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat membuat materi pembelajaran. Silakan coba lagi.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $material = $this->materialService->findMaterial($id);

        return Inertia::render('Materials/show', [
            'material' => $material,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $material = $this->materialService->findMaterial($id);

        $classrooms = DB::table('kelas_mata_pelajaran')
            ->join('kelas', 'kelas_mata_pelajaran.id_kelas', '=', 'kelas.id')
            ->where('kelas_mata_pelajaran.id_mata_pelajaran', $material->subject_id)
            ->select(['kelas.id', 'kelas.nama_kelas as name'])
            ->get();

        return Inertia::render('Materials/edit', [
            'material' => $material,
            'classrooms' => $classrooms,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMaterialRequest $request, Material $material)
    {
        $data = $request->validated();
        $this->materialService->updateMaterial($material->id, $data);

        try {
            $updatedMaterial = $this->materialService->findMaterial($material->id);

            if (! empty($updatedMaterial->classroom_id)) {
                return redirect()->route('teacher.subjects.classrooms.materials', [$updatedMaterial->subject_id, $updatedMaterial->classroom_id])
                    ->with('success', 'Data materi pembelajaran telah berhasil diperbarui.');
            }

            return redirect()->route('teacher.subjects.show', $updatedMaterial->subject_id)
                ->with('success', 'Data materi pembelajaran telah berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Error updating material: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui data materi pembelajaran. Silakan coba lagi.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material)
    {
        Gate::authorize('delete', $material);

        $subjectId = $material->subject_id;
        $classroomId = $material->classroom_id;

        try {
            $this->materialService->deleteMaterial($material->id);

            if (! empty($classroomId)) {
                return redirect()->route('teacher.subjects.classrooms.materials', [$subjectId, $classroomId])
                    ->with('success', 'Materi pembelajaran telah berhasil dihapus.');
            }

            return redirect()->route('teacher.subjects.show', $subjectId)
                ->with('success', 'Materi pembelajaran telah berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Error deleting material: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menghapus materi pembelajaran. Silakan coba lagi.');
        }
    }
}
