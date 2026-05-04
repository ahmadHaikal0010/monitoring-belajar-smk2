<?php

namespace App\Http\Controllers;

use App\Http\Requests\Teacher\StoreTeacherRequest;
use App\Http\Requests\Teacher\UpdateTeacherRequest;
use App\Models\Teacher;
use App\Services\TeacherService;
use Exception;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TeacherController extends Controller
{
    protected TeacherService $teacherService;

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

        try {
            $this->teacherService->createTeacher($data);

            return redirect()->route('teacher.profile')->with('success', 'Profil guru Anda telah berhasil dibuat.');
        } catch (Exception $e) {
            Log::error('Error creating teacher profile: '.$e->getMessage());

            return redirect()->back()->with('error', 'Terjadi kesalahan saat membuat profil guru. Silakan coba lagi.');
        }

    }

    public function profile()
    {
        $userId = auth()->id();
        $teacher = $this->teacherService->getTeacherByUserId($userId);

        return Inertia::render('Teacher/profile', [
            'teacher' => $teacher,
        ]);
    }

    public function edit()
    {
        $userId = auth()->id();
        $teacher = $this->teacherService->getTeacherByUserId($userId);

        return Inertia::render('Teacher/edit', [
            'teacher' => $teacher,
        ]);
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher)
    {
        $data = $request->validated();

        try {
            $this->teacherService->updateTeacher($data, $teacher->user_id);

            return redirect()->route('teacher.profile')
                ->with('success', 'Profil guru Anda telah berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('Error updating teacher profile: '.$e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui profil guru. Silakan coba lagi.');
        }
    }
}
