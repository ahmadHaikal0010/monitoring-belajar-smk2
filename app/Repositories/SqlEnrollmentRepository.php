<?php

namespace App\Repositories;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlEnrollmentRepository implements EnrollmentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('pendaftaran')
            ->join('siswa', 'pendaftaran.id_siswa', '=', 'siswa.id')
            ->join('pengguna as student_users', 'siswa.id_pengguna', '=', 'student_users.id')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->join('pengguna as teacher_users', 'guru.id_pengguna', '=', 'teacher_users.id')
            ->select([
                'pendaftaran.id',
                'pendaftaran.status',
                'pendaftaran.terdaftar_pada as enrolled_at',
                'student_users.nama as student_name',
                'student_users.email as student_email',
                'siswa.nisn as student_nisn',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.kode as subject_code',
                'teacher_users.nama as teacher_name',
            ]);

        if (! empty($filters['teacher_id'])) {
            $query->where('mata_pelajaran.id_guru', $filters['teacher_id']);
        }

        if (! empty($filters['subject_id'])) {
            $query->where('pendaftaran.id_mata_pelajaran', $filters['subject_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('pendaftaran.status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('student_users.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('siswa.nisn', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('mata_pelajaran.judul', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('mata_pelajaran.kode', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'pendaftaran.terdaftar_pada';
        $sortDirection = $filters['direction'] ?? 'desc';

        $sortFieldMap = [
            'student_users.name' => 'student_users.nama',
            'subjects.title' => 'mata_pelajaran.judul',
            'enrollments.enrolled_at' => 'pendaftaran.terdaftar_pada',
            'enrollments.status' => 'pendaftaran.status',
        ];

        $dbSortField = $sortFieldMap[$sortField] ?? ($sortFieldMap[$sortField] ?? 'pendaftaran.terdaftar_pada');
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)->withQueryString();
    }

    public function getPaginatedWithProgress(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('pendaftaran')
            ->join('siswa', 'pendaftaran.id_siswa', '=', 'siswa.id')
            ->join('pengguna as student_users', 'siswa.id_pengguna', '=', 'student_users.id')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->join('pengguna as teacher_users', 'guru.id_pengguna', '=', 'teacher_users.id')
            ->select([
                'pendaftaran.id',
                'pendaftaran.id_siswa as student_id',
                'pendaftaran.id_mata_pelajaran as subject_id',
                'pendaftaran.status',
                'pendaftaran.terdaftar_pada as enrolled_at',
                'student_users.nama as student_name',
                'student_users.email as student_email',
                'siswa.nisn as student_nisn',
                'siswa.foto as student_photo',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.kode as subject_code',
                'teacher_users.nama as teacher_name',
            ])
            ->addSelect([
                'total_materials' => DB::table('materi')
                    ->whereColumn('materi.id_mata_pelajaran', 'pendaftaran.id_mata_pelajaran')
                    ->selectRaw('count(*)'),
            ])
            ->addSelect([
                'completed_materials' => DB::table('progres_siswa')
                    ->whereColumn('progres_siswa.id_pendaftaran', 'pendaftaran.id')
                    ->where('selesai', true)
                    ->selectRaw('count(*)'),
            ]);

        if (! empty($filters['teacher_id'])) {
            $query->where('mata_pelajaran.id_guru', $filters['teacher_id']);
        }

        if (! empty($filters['subject_id'])) {
            $query->where('pendaftaran.id_mata_pelajaran', $filters['subject_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('pendaftaran.status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('student_users.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('siswa.nisn', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('mata_pelajaran.judul', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('mata_pelajaran.kode', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'pendaftaran.terdaftar_pada';
        $sortDirection = $filters['direction'] ?? 'desc';

        $sortFieldMap = [
            'student_users.name' => 'student_users.nama',
            'subjects.title' => 'mata_pelajaran.judul',
            'enrollments.enrolled_at' => 'pendaftaran.terdaftar_pada',
            'enrollments.status' => 'pendaftaran.status',
        ];

        $dbSortField = $sortFieldMap[$sortField] ?? ($sortFieldMap[$sortField] ?? 'pendaftaran.terdaftar_pada');
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($item) {
                $item->student_photo_url = $item->student_photo
                    ? url('storage/'.ltrim($item->student_photo, '/'))
                    : null;

                return $item;
            });
    }

    public function findWithProgress(string $id)
    {
        $enrollment = DB::table('pendaftaran')
            ->join('siswa', 'pendaftaran.id_siswa', '=', 'siswa.id')
            ->join('pengguna as student_users', 'siswa.id_pengguna', '=', 'student_users.id')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->where('pendaftaran.id', $id)
            ->select([
                'pendaftaran.id',
                'pendaftaran.id_siswa as student_id',
                'pendaftaran.id_mata_pelajaran as subject_id',
                'pendaftaran.status',
                'pendaftaran.terdaftar_pada as enrolled_at',
                'student_users.nama as student_name',
                'mata_pelajaran.judul as subject_title',
                'mata_pelajaran.id_guru as teacher_id',
                'siswa.foto as student_photo',
            ])
            ->addSelect([
                'total_materials' => DB::table('materi')
                    ->whereColumn('materi.id_mata_pelajaran', 'pendaftaran.id_mata_pelajaran')
                    ->selectRaw('count(*)'),
            ])
            ->addSelect([
                'completed_materials' => DB::table('progres_siswa')
                    ->whereColumn('progres_siswa.id_pendaftaran', 'pendaftaran.id')
                    ->where('selesai', true)
                    ->selectRaw('count(*)'),
            ])
            ->first();

        if ($enrollment) {
            $enrollment->student_photo_url = $enrollment->student_photo
                ? url('storage/'.ltrim($enrollment->student_photo, '/'))
                : null;
        }

        return $enrollment;
    }

    public function find(string $id)
    {
        return DB::table('pendaftaran')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->where('pendaftaran.id', $id)
            ->select([
                'pendaftaran.id',
                'pendaftaran.id_siswa as student_id',
                'pendaftaran.id_mata_pelajaran as subject_id',
                'pendaftaran.status',
                'pendaftaran.terdaftar_pada as enrolled_at',
                'mata_pelajaran.id_guru as teacher_id',
            ])
            ->first();
    }

    public function enroll(string $studentId, string $subjectId)
    {
        DB::table('pendaftaran')->insert([
            'id' => (string) Uuid::v7(),
            'id_siswa' => $studentId,
            'id_mata_pelajaran' => $subjectId,
            'status' => 'enrolled',
            'terdaftar_pada' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function isEnrolled(string $studentId, string $subjectId): bool
    {
        return DB::table('pendaftaran')
            ->where('id_siswa', $studentId)
            ->where('id_mata_pelajaran', $subjectId)
            ->exists();
    }

    public function getByStudentAndSubject(string $studentId, string $subjectId)
    {
        return DB::table('pendaftaran')
            ->where('id_siswa', $studentId)
            ->where('id_mata_pelajaran', $subjectId)
            ->select([
                'id',
                'id_siswa as student_id',
                'id_mata_pelajaran as subject_id',
                'status',
                'terdaftar_pada as enrolled_at',
            ])
            ->first();
    }

    public function getStudentEnrollments(string $studentId)
    {
        return DB::table('pendaftaran')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->join('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->where('pendaftaran.id_siswa', $studentId)
            ->select([
                'mata_pelajaran.id',
                'mata_pelajaran.judul as title',
                'mata_pelajaran.kode as code',
                'mata_pelajaran.deskripsi as description',
                'pengguna.nama as teacher_name',
                'pendaftaran.status',
                'pendaftaran.terdaftar_pada as enrolled_at',
            ])
            ->orderBy('mata_pelajaran.judul', 'asc')
            ->get();
    }

    public function getStudentEnrollmentsWithProgress(string $studentId)
    {
        return DB::table('pendaftaran')
            ->join('mata_pelajaran', 'pendaftaran.id_mata_pelajaran', '=', 'mata_pelajaran.id')
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->join('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->where('pendaftaran.id_siswa', $studentId)
            ->select([
                'mata_pelajaran.id',
                'mata_pelajaran.judul as title',
                'mata_pelajaran.kode as code',
                'mata_pelajaran.deskripsi as description',
                'pengguna.nama as teacher_name',
                'pendaftaran.id as enrollment_id',
                'pendaftaran.status',
                'pendaftaran.terdaftar_pada as enrolled_at',
            ])
            ->addSelect([
                'total_materials' => DB::table('materi')
                    ->whereColumn('materi.id_mata_pelajaran', 'pendaftaran.id_mata_pelajaran')
                    ->selectRaw('count(*)'),
            ])
            ->addSelect([
                'completed_materials' => DB::table('progres_siswa')
                    ->whereColumn('progres_siswa.id_pendaftaran', 'pendaftaran.id')
                    ->where('selesai', true)
                    ->selectRaw('count(*)'),
            ])
            ->orderBy('mata_pelajaran.judul', 'asc')
            ->get();
    }

    public function delete(string $id)
    {
        DB::table('pendaftaran')->where('id', $id)->delete();
    }
}
