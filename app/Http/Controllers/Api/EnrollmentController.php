<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\EnrollmentRequest;
use App\Services\EnrollmentService;
use App\Services\StudentService;
use App\Services\SubjectService;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    protected EnrollmentService $enrollmentService;
    protected StudentService $studentService;
    protected SubjectService $subjectService;

    public function __construct(
        EnrollmentService $enrollmentService,
        StudentService $studentService,
        SubjectService $subjectService
    ) {
        $this->enrollmentService = $enrollmentService;
        $this->studentService = $studentService;
        $this->subjectService = $subjectService;
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
     * Get the list of all subjects available for the student's class.
     */
    public function availableSubjects(Request $request)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student || ! $student->id_kelas) {
            return response()->json([
                'success' => false,
                'message' => 'Anda belum terdaftar di kelas manapun.',
                'data' => [],
            ]);
        }

        $allSubjects = $this->subjectService->getSubjectsByClassroom($student->id_kelas);
        $enrolledSubjectIds = collect($this->enrollmentService->getStudentSubjects($student->id))
            ->pluck('id')
            ->toArray();

        $data = collect($allSubjects)->map(function ($subject) use ($enrolledSubjectIds) {
            $subject->is_enrolled = in_array($subject->id, $enrolledSubjectIds);
            return $subject;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Enroll a student to a subject.
     */
    public function store(EnrollmentRequest $request)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(404, 'Data profil siswa tidak ditemukan.');
        }

        $data = $request->validated();

        if ($this->enrollmentService->checkEnrollment($student->id, $data['subject_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah terdaftar di mata pelajaran ini.',
            ], 422);
        }

        $this->enrollmentService->enrollStudent($student->id, $data['subject_id']);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendaftar ke mata pelajaran baru.',
        ]);
    }

    /**
     * Unenroll a student from a subject.
     */
    public function destroy(Request $request, string $subjectId)
    {
        $user = $request->user();
        $student = $this->studentService->getStudentByUserId($user->id);

        if (! $student) {
            abort(404, 'Data profil siswa tidak ditemukan.');
        }

        $this->enrollmentService->unenrollStudent($student->id, $subjectId);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil melepas pendaftaran mata pelajaran.',
        ]);
    }
}
