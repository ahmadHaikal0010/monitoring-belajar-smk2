<?php

namespace App\Http\Controllers;

use App\Http\Requests\Subject\StoreSubjectRequest;
use App\Services\SubjectService;
use Inertia\Inertia;

class SubjectController extends Controller
{
    protected SubjectService $subjectService;

    public function __construct(SubjectService $subjectService)
    {
        $this->subjectService = $subjectService;
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

    public function store(StoreSubjectRequest $request)
    {
        $this->subjectService->createSubject($request->validated());
    }
}
