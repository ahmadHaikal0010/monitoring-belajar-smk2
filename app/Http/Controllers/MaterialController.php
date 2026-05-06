<?php

namespace App\Http\Controllers;

use App\Http\Requests\Material\StoreMaterialRequest;
use App\Http\Requests\Material\UpdateMaterialRequest;
use App\Models\Material;
use App\Services\MaterialService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Exception;
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
     * Display a listing of the resource.
     */
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction', 'subject_id']);

        $user = auth()->user();
        if ($user->role === 'guru') {
            $teacher = $this->teacherService->getTeacherByUserId($user->id);
            $filters['teacher_id'] = $teacher->id ?? null;
        }

        if (! empty($filters['subject_id'])) {
            $selectedSubject = $this->subjectService->getSubjectById($filters['subject_id']);

            if ($user->role === 'guru' && ($selectedSubject->teacher_id ?? null) !== ($filters['teacher_id'] ?? null)) {
                return redirect()->route('teacher.materials.index')
                    ->with('error', 'Anda tidak memiliki hak akses untuk mata pelajaran tersebut.');
            }

            $materials = $this->materialService->getPaginatedMaterials($filters);

            return Inertia::render('Materials/index', [
                'materials' => $materials,
                'selectedSubject' => $selectedSubject,
                'filters' => $filters,
                'mode' => 'materials',
            ]);
        }

        $subjects = $this->subjectService->getSubjectList($filters, 12);

        return Inertia::render('Materials/index', [
            'subjects' => $subjects,
            'filters' => $filters,
            'mode' => 'subjects',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $subjectId = request('subject_id');

        if (! $subjectId) {
            return redirect()->route('teacher.materials.index')
                ->with('error', 'Silakan pilih mata pelajaran terlebih dahulu.');
        }

        $subject = $this->subjectService->getSubjectById($subjectId);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if ($subject->teacher_id !== $teacher->id) {
            return Inertia::render('unauthorized', [
                'message' => 'Anda tidak memiliki wewenang untuk menambahkan materi pada mata pelajaran ini.',
            ]);
        }

        return Inertia::render('Materials/create', [
            'subject' => $subject,
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

        if ($subject->teacher_id !== $teacher->id) {
            abort(403, 'Tindakan tidak diizinkan.');
        }

        try {
            $this->materialService->createMaterial($data);

            return redirect()->route('teacher.materials.index', ['subject_id' => $data['subject_id']])
                ->with('success', 'Materi pembelajaran baru telah berhasil diterbitkan.');
        } catch (Exception $e) {
            Log::error('Error creating material: '.$e->getMessage());

            return redirect()->route('teacher.materials.index', ['subject_id' => $data['subject_id']])
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

        return Inertia::render('Materials/edit', [
            'material' => $material,
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
            $material = $this->materialService->findMaterial($material->id);

            return redirect()->route('teacher.materials.index', ['subject_id' => $material->subject_id])
                ->with('success', 'Data materi pembelajaran telah berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Error updating material: '.$e->getMessage());

            return redirect()->route('teacher.materials.index', ['subject_id' => $material->subject_id])
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

        try {
            $this->materialService->deleteMaterial($material->id);

            return redirect()->route('teacher.materials.index', ['subject_id' => $subjectId])
                ->with('success', 'Materi pembelajaran telah berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Error deleting material: '.$e->getMessage());

            return redirect()->route('teacher.materials.index', ['subject_id' => $subjectId])
                ->with('error', 'Terjadi kesalahan saat menghapus materi pembelajaran. Silakan coba lagi.');
        }
    }
}
