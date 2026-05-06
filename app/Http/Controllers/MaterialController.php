<?php

namespace App\Http\Controllers;

use App\Http\Requests\Material\StoreMaterialRequest;
use App\Models\Material;
use App\Services\MaterialService;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Illuminate\Support\Facades\Gate;
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

            // Validasi kepemilikan jika user adalah guru
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
        Gate::authorize('create', Material::class);

        $subjectId = request('subject_id');

        if (! $subjectId) {
            return redirect()->route('teacher.materials.index')
                ->with('error', 'Silakan pilih mata pelajaran terlebih dahulu.');
        }

        $subject = $this->subjectService->getSubjectById($subjectId);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        // Validasi kepemilikan: Hanya guru pengampu yang bisa tambah materi
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

        // Proteksi tambahan di sisi server
        $subject = $this->subjectService->getSubjectById($data['subject_id']);
        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if ($subject->teacher_id !== $teacher->id) {
            abort(403, 'Tindakan tidak diizinkan.');
        }

        $this->materialService->createMaterial($data);

        return redirect()->route('teacher.materials.index', ['subject_id' => $data['subject_id']])
            ->with('success', 'Materi pembelajaran baru telah berhasil diterbitkan.');
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
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
