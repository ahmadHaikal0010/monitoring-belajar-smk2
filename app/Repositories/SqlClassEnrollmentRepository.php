<?php

namespace App\Repositories;

use App\Repositories\Interfaces\ClassEnrollmentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlClassEnrollmentRepository implements ClassEnrollmentRepositoryInterface
{
    public function getStudentsInClassroom(string $classroomId, array $filters = [], int $perPage = 15)
    {
        $query = DB::table('anggota_kelas')
            ->join('siswa', 'anggota_kelas.id_siswa', '=', 'siswa.id')
            ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
            ->where('anggota_kelas.id_kelas', $classroomId)
            ->select([
                'anggota_kelas.id as enrollment_id',
                'anggota_kelas.id_kelas as classroom_id',
                'anggota_kelas.id_siswa as student_id',
                'anggota_kelas.status',
                'anggota_kelas.created_at as enrolled_at',
                'siswa.nisn',
                'siswa.foto as photo',
                'pengguna.nama as student_name',
                'pengguna.email as student_email',
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('pengguna.nama', 'ilike', "%{$search}%")
                    ->orWhere('siswa.nisn', 'ilike', "%{$search}%")
                    ->orWhere('pengguna.email', 'ilike', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('anggota_kelas.status', $filters['status']);
        }

        return $query->orderBy('pengguna.nama', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getUnassignedStudents(array $filters = [], int $perPage = 15)
    {
        // Students who are not currently in any active class enrollment
        $assignedStudentIds = DB::table('anggota_kelas')
            ->where('status', 'aktif')
            ->pluck('id_siswa');

        $query = DB::table('siswa')
            ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
            ->whereNotIn('siswa.id', $assignedStudentIds)
            ->select([
                'siswa.id as student_id',
                'siswa.nisn',
                'siswa.foto as photo',
                'pengguna.nama as student_name',
                'pengguna.email as student_email',
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('pengguna.nama', 'ilike', "%{$search}%")
                    ->orWhere('siswa.nisn', 'ilike', "%{$search}%")
                    ->orWhere('pengguna.email', 'ilike', "%{$search}%");
            });
        }

        return $query->orderBy('pengguna.nama', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function assignStudentsToClassroom(string $classroomId, array $studentIds)
    {
        DB::transaction(function () use ($classroomId, $studentIds) {
            foreach ($studentIds as $studentId) {
                $existing = DB::table('anggota_kelas')
                    ->where('id_kelas', $classroomId)
                    ->where('id_siswa', $studentId)
                    ->first();

                if ($existing) {
                    DB::table('anggota_kelas')
                        ->where('id', $existing->id)
                        ->update([
                            'status' => 'aktif',
                            'updated_at' => now(),
                        ]);
                } else {
                    DB::table('anggota_kelas')->insert([
                        'id' => (string) Uuid::v7(),
                        'id_kelas' => $classroomId,
                        'id_siswa' => $studentId,
                        'status' => 'aktif',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                // Update active classroom on student model
                DB::table('siswa')
                    ->where('id', $studentId)
                    ->update([
                        'id_kelas' => $classroomId,
                        'updated_at' => now(),
                    ]);
            }
        });
    }

    public function removeStudentFromClassroom(string $classroomId, string $studentId)
    {
        DB::transaction(function () use ($classroomId, $studentId) {
            DB::table('anggota_kelas')
                ->where('id_kelas', $classroomId)
                ->where('id_siswa', $studentId)
                ->delete();

            DB::table('siswa')
                ->where('id', $studentId)
                ->where('id_kelas', $classroomId)
                ->update([
                    'id_kelas' => null,
                    'updated_at' => now(),
                ]);
        });
    }

    public function updateEnrollmentStatus(string $classroomId, string $studentId, string $status)
    {
        DB::transaction(function () use ($classroomId, $studentId, $status) {
            DB::table('anggota_kelas')
                ->where('id_kelas', $classroomId)
                ->where('id_siswa', $studentId)
                ->update([
                    'status' => $status,
                    'updated_at' => now(),
                ]);

            if ($status !== 'aktif') {
                DB::table('siswa')
                    ->where('id', $studentId)
                    ->where('id_kelas', $classroomId)
                    ->update([
                        'id_kelas' => null,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('siswa')
                    ->where('id', $studentId)
                    ->update([
                        'id_kelas' => $classroomId,
                        'updated_at' => now(),
                    ]);
            }
        });
    }
}
