<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\StoreTeacherRequest;
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
        $filters = request()->only(['search']);
        $assignableUsers = $this->teacherService->getAssignableUsers($filters, 10);

        return Inertia::render('Admin/Teachers/create', [
            'assignableUsers' => $assignableUsers,
            'filters' => $filters,
        ]);
    }

    public function store(StoreTeacherRequest $request)
    {
        $data = $request->validated();
        $this->teacherService->createTeacher($data);

        return redirect()->route('admin.teachers.index')
            ->with('success', 'Berhasil! Profil guru baru telah dibuat dan akun user sudah terhubung.');
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
