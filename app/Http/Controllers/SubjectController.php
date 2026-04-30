<?php

namespace App\Http\Controllers;

use App\Http\Requests\Subject\StoreSubjectRequest;
use App\Services\SubjectService;
use App\Services\TeacherService;
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

    public function index()
    {
        $filters = request()->only(['search', 'sort', 'direction']);
        $subjects = $this->subjectService->getSubjectList($filters, 12);

        return Inertia::render('Subjects/index', [
            'subjects' => $subjects,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('Subjects/create');
    }

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
}
