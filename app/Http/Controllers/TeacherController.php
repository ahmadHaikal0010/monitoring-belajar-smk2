<?php

namespace App\Http\Controllers;

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

    public function create()
    {
        return Inertia::render('Teacher/create');
    }

    public function store(StoreTeacherRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id();

        $this->teacherService->createTeacher($data);

        return redirect()->route('dashboard');
    }

    public function profile()
    {
        $userId = auth()->id();
        $teacher = $this->teacherService->getTeacherByUserId($userId);

        return Inertia::render('Teacher/profile', [
            'teacher' => $teacher,
        ]);
    }
}
