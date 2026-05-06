<?php

namespace App\Http\Controllers;

use App\Services\MaterialService;
use App\Services\SubjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaterialController extends Controller
{
    protected MaterialService $materialService;

    protected SubjectService $subjectService;

    public function __construct(MaterialService $materialService, SubjectService $subjectService)
    {
        $this->materialService = $materialService;
        $this->subjectService = $subjectService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction', 'subject_id']);

        // Jika ada subject_id, tampilkan daftar materi untuk subject tersebut
        if (! empty($filters['subject_id'])) {
            $materials = $this->materialService->getPaginatedMaterials($filters);
            $selectedSubject = $this->subjectService->getSubjectById($filters['subject_id']);

            return Inertia::render('Materials/index', [
                'materials' => $materials,
                'selectedSubject' => $selectedSubject,
                'filters' => $filters,
                'mode' => 'materials',
            ]);
        }

        // Jika tidak ada subject_id, tampilkan daftar mata pelajaran (seperti di index subject)
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
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
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
