<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Services\StudentService;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    protected StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    /**
     * Get the authenticated student's profile.
     */
    public function profile(Request $request)
    {
        $user = $request->user()->load('student');
        
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ]
        ]);
    }

    /**
     * Update the authenticated student's profile.
     */
    public function update(UpdateProfileRequest $request)
    {
        $userId = $request->user()->id;
        $data = $request->validated();

        $this->studentService->updateStudentProfile($userId, $data);

        return response()->json([
            'success' => true,
            'message' => 'Profil Anda telah berhasil diperbarui.',
            'data' => $request->user()->load('student'),
        ]);
    }
}
