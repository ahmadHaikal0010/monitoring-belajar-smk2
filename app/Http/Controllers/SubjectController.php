<?php

namespace App\Http\Controllers;

use App\Http\Requests\Subject\StoreSubjectRequest;
use App\Http\Requests\Subject\UpdateSubjectRequest;
use App\Models\Subject;
use App\Services\SubjectService;
use App\Services\TeacherService;
use Exception;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubjectController extends Controller
{
    protected SubjectService $subjectService;

    protected TeacherService $teacherService;

    public function __construct(SubjectService $subjectService, TeacherService $teacherService)
    {
        $this->subjectService = $subjectService;
        $this->teacherService = $teacherService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction']);
        $subjects = $this->subjectService->getSubjectList($filters, 12);

        return Inertia::render('Subjects/index', [
            'subjects' => $subjects,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Subjects/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSubjectRequest $request)
    {
        $data = $request->validated();

        $teacher = $this->teacherService->getTeacherByUserId(auth()->id());

        if (! $teacher) {
            return redirect()->back()->with('error', 'Profil pengajar Anda tidak ditemukan. Pastikan Anda sudah melengkapi profil guru.');
        }

        $data['teacher_id'] = $teacher->id;

        $this->subjectService->createSubject($data);

        return redirect()->route('teacher.subjects.index')
            ->with('success', 'Mata pelajaran baru telah berhasil ditambahkan ke dalam daftar.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        $subjectData = $this->subjectService->getSubjectById($subject->id);

        return Inertia::render('Subjects/show', [
            'subject' => $subjectData,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Subject $subject)
    {
        $subjectData = $this->subjectService->getSubjectById($subject->id);

        return Inertia::render('Subjects/edit', [
            'subject' => $subjectData,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        $data = $request->validated();

        // Ensure teacher_id is preserved
        $data['teacher_id'] = $subject->teacher_id;

        $this->subjectService->updateSubject($subject->id, $data);

        return redirect()->route('teacher.subjects.index')
            ->with('success', 'Data mata pelajaran telah berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        try {
            Gate::authorize('delete', $subject);
            $this->subjectService->deleteSubject($subject->id);

            return redirect()->route('teacher.subjects.index')
                ->with('success', 'Mata pelajaran telah berhasil dihapus.');
        } catch (Exception $e) {
            Log::error('Error deleting subject: ' . $e->getMessage());

            return redirect()->route('teacher.subjects.index')
                ->with('error', 'Terjadi kesalahan saat menghapus mata pelajaran. Silakan coba lagi.');
        }
    }
}
