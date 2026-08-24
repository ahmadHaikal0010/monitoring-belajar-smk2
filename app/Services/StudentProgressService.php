<?php

namespace App\Services;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\MaterialRepositoryInterface;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;

class StudentProgressService
{
    public function __construct(
        protected StudentProgressRepositoryInterface $progressRepository,
        protected EnrollmentRepositoryInterface $enrollmentRepository,
        protected MaterialRepositoryInterface $materialRepository
    ) {}

    /**
     * Mark a material as completed for a student.
     */
    public function markAsCompleted(string $studentId, string $materialId): array
    {
        $material = $this->materialRepository->find($materialId);
        if (! $material) {
            return ['success' => false, 'message' => 'Material not found'];
        }

        // Check if student is enrolled in the subject of this material
        $enrollment = $this->enrollmentRepository->getByStudentAndSubject($studentId, $material->subject_id);
        if (! $enrollment) {
            return ['success' => false, 'message' => 'Student is not enrolled in this subject'];
        }

        $progress = $this->progressRepository->updateOrCreate(
            [
                'enrollment_id' => $enrollment->id,
                'material_id' => $materialId,
            ],
            [
                'is_completed' => true,
                'completed_at' => Date::now(),
            ]
        );

        return ['success' => true, 'data' => $progress];
    }

    /**
     * Get progress for a student in a specific subject.
     */
    public function getSubjectProgress(string $studentId, string $subjectId): array
    {
        $enrollment = $this->enrollmentRepository->getByStudentAndSubject($studentId, $subjectId);
        if (! $enrollment) {
            return ['success' => false, 'message' => 'Student is not enrolled in this subject'];
        }

        $materials = $this->materialRepository->getBySubjectId($subjectId);
        $progress = $this->progressRepository->getByEnrollment($enrollment->id);

        $completedMaterialIds = $progress->filter(fn ($p) => $p->is_completed || $p->selesai)->map(fn ($p) => $p->material_id ?? $p->id_materi)->values()->toArray();

        $totalMaterials = count($materials);
        $completedMaterials = count($completedMaterialIds);
        $percentage = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

        $examResults = DB::table('ujian')
            ->leftJoin('sesi_ujian', function ($join) use ($studentId) {
                $join->on('ujian.id', '=', 'sesi_ujian.id_ujian')
                    ->where('sesi_ujian.id_siswa', '=', $studentId);
            })
            ->where('ujian.id_mata_pelajaran', $subjectId)
            ->where('ujian.status', 'published')
            ->select([
                'ujian.id as exam_id',
                'ujian.judul as exam_title',
                'ujian.nilai_kkm as pass_score',
                'ujian.durasi as duration',
                'sesi_ujian.id as session_id',
                'sesi_ujian.status as session_status',
                'sesi_ujian.total_skor as total_score',
                'sesi_ujian.dikumpulkan_pada as submitted_at',
            ])
            ->orderBy('ujian.created_at', 'asc')
            ->get()
            ->map(function ($item) {
                $item->is_passed = $item->total_score !== null ? ((float) $item->total_score >= (float) $item->pass_score) : null;

                return $item;
            });

        return [
            'success' => true,
            'data' => [
                'total_materials' => $totalMaterials,
                'completed_materials' => $completedMaterials,
                'percentage' => $percentage,
                'completed_material_ids' => $completedMaterialIds,
                'exam_results' => $examResults,
            ],
        ];
    }
}
