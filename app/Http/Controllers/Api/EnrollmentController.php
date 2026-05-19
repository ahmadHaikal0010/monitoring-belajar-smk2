<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\EnrollmentRequest;
use App\Services\EnrollmentService;
use App\Services\StudentService;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    protected EnrollmentService $enrollmentService;

    protected StudentService $studentService;

    public function __construct(EnrollmentService $enrollmentService, StudentService $studentService)
    {
        $this->enrollmentService = $enrollmentService;
        $this->studentService = $studentService;
    }

    /**
     * Get the list of subjects enrolled by the student.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(404, 'Data profil siswa tidak ditemukan.');
        }

        $enrollments = $this->enrollmentService->getStudentSubjects($student->id);

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    /**
     * Enroll a student to a subject using a code.
     */
    public function store(EnrollmentRequest $request)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(404, 'Data profil siswa tidak ditemukan.');
        }

        $data = $request->validated();
        $this->enrollmentService->enrollByCode($student->id, $data['code']);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendaftar ke mata pelajaran baru.',
        ]);
    }
}
