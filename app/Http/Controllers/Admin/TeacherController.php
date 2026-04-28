<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\TeacherService;
use Inertia\Inertia;

class TeacherController extends Controller
{
    protected $teacherService;

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
        return Inertia::render('Admin/Teachers/create');
    }

    public function store()
    {
        // Akan diimplementasikan nanti
    }

    public function show($id)
    {
        // Akan diimplementasikan nanti
    }

    public function edit($id)
    {
        // Akan diimplementasikan nanti
    }

    public function update($id)
    {
        // Akan diimplementasikan nanti
    }

    public function destroy($id)
    {
        // Akan diimplementasikan nanti
    }
}
