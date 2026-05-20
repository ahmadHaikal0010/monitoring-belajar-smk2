<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EnrollmentService;
use App\Services\MaterialService;
use App\Services\StudentService;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    protected MaterialService $materialService;

    protected EnrollmentService $enrollmentService;

    protected StudentService $studentService;

    public function __construct(
        MaterialService $materialService,
        EnrollmentService $enrollmentService,
        StudentService $studentService
    ) {
        $this->materialService = $materialService;
        $this->enrollmentService = $enrollmentService;
        $this->studentService = $studentService;
    }

    /**
     * Get materials for a specific subject.
     */
    public function index(Request $request, string $subjectId)
    {
        $user = $request->user();

        // Jika siswa, cek pendaftaran
        if ($user->role === 'siswa') {
            $student = $this->studentService->getStudentByUserId($user->id);
            if (! $student || ! $this->enrollmentService->checkEnrollment($student->id, $subjectId)) {
                abort(403, 'Anda belum terdaftar pada mata pelajaran ini.');
            }
        }

        $filters = $request->only(['search', 'sort', 'direction']);
        $filters['subject_id'] = $subjectId;

        $materials = $this->materialService->getPaginatedMaterials($filters, 20);

        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    /**
     * Get detail of a specific material.
     */
    public function show(Request $request, string $id)
    {
        $material = $this->materialService->findMaterial($id);

        if (! $material) {
            abort(404, 'Materi tidak ditemukan.');
        }

        $user = $request->user();

        // Jika siswa, cek pendaftaran pada subject terkait materi ini
        if ($user->role === 'siswa') {
            $student = $this->studentService->getStudentByUserId($user->id);
            if (! $student || ! $this->enrollmentService->checkEnrollment($student->id, $material->subject_id)) {
                abort(403, 'Anda tidak memiliki hak akses untuk materi ini.');
            }
        }

        return response()->json([
            'success' => true,
            'data' => $material,
        ]);
    }
}
