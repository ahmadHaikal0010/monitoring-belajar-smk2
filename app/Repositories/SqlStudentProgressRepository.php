<?php

namespace App\Repositories;

use App\Models\StudentProgress;
use App\Repositories\Interfaces\StudentProgressRepositoryInterface;
use Illuminate\Support\Facades\DB;

class SqlStudentProgressRepository implements StudentProgressRepositoryInterface
{
    public function getByEnrollmentAndMaterial(string $enrollmentId, string $materialId): ?StudentProgress
    {
        return StudentProgress::where('id_pendaftaran', $enrollmentId)
            ->where('id_materi', $materialId)
            ->first();
    }

    public function updateOrCreate(array $criteria, array $data): StudentProgress
    {
        $dbCriteria = [];
        if (isset($criteria['enrollment_id'])) {
            $dbCriteria['id_pendaftaran'] = $criteria['enrollment_id'];
        }
        if (isset($criteria['material_id'])) {
            $dbCriteria['id_materi'] = $criteria['material_id'];
        }

        $dbData = [];
        if (isset($data['is_completed'])) {
            $dbData['selesai'] = $data['is_completed'];
        }
        if (isset($data['completed_at'])) {
            $dbData['diselesaikan_pada'] = $data['completed_at'];
        }

        return StudentProgress::updateOrCreate($dbCriteria, $dbData);
    }

    public function getByEnrollment(string $enrollmentId)
    {
        return StudentProgress::where('id_pendaftaran', $enrollmentId)->get();
    }

    public function getOverallStats(string $studentId): array
    {
        $enrollments = DB::table('pendaftaran')
            ->where('id_siswa', $studentId)
            ->pluck('id', 'id_mata_pelajaran')
            ->toArray();

        $subjectIds = array_keys($enrollments);
        $enrollmentIds = array_values($enrollments);

        $totalMaterials = DB::table('materi')
            ->whereIn('id_mata_pelajaran', $subjectIds)
            ->count();

        $completedMaterials = DB::table('progres_siswa')
            ->whereIn('id_pendaftaran', $enrollmentIds)
            ->where('selesai', true)
            ->count();

        $percentage = $totalMaterials > 0 ? round(($completedMaterials / $totalMaterials) * 100) : 0;

        return [
            'total_enrolled_subjects' => count($subjectIds),
            'total_completed_materials' => $completedMaterials,
            'overall_progress_percentage' => $percentage,
        ];
    }

    public function getRecentActivities(string $studentId, int $limit = 5)
    {
        return DB::table('progres_siswa')
            ->join('pendaftaran', 'progres_siswa.id_pendaftaran', '=', 'pendaftaran.id')
            ->join('materi', 'progres_siswa.id_materi', '=', 'materi.id')
            ->join('mata_pelajaran', 'materi.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->where('pendaftaran.id_siswa', $studentId)
            ->where('progres_siswa.selesai', true)
            ->select([
                'materi.id as material_id',
                'materi.judul as material_title',
                'mata_pelajaran.judul as subject_title',
                'progres_siswa.diselesaikan_pada as last_accessed',
            ])
            ->orderBy('progres_siswa.diselesaikan_pada', 'desc')
            ->limit($limit)
            ->get();
    }
}
