<?php

namespace App\Repositories;

use App\Repositories\Interfaces\ClassroomRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlClassroomRepository implements ClassroomRepositoryInterface
{
    public function getAll()
    {
        return DB::table('kelas')
            ->join('jurusan', 'kelas.id_jurusan', '=', 'jurusan.id')
            ->select([
                'kelas.id',
                'kelas.id_jurusan as major_id',
                'kelas.id_wali_kelas as homeroom_teacher_id',
                'kelas.tingkat as grade',
                'kelas.rombel as section',
                'kelas.nama_kelas as name',
                'kelas.tahun_ajaran as academic_year',
                'jurusan.kode_jurusan as major_code',
                'jurusan.nama_jurusan as major_name',
            ])
            ->orderBy('kelas.tingkat', 'asc')
            ->orderBy('jurusan.kode_jurusan', 'asc')
            ->orderBy('kelas.rombel', 'asc')
            ->get();
    }

    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $query = DB::table('kelas')
            ->join('jurusan', 'kelas.id_jurusan', '=', 'jurusan.id')
            ->leftJoin('guru', 'kelas.id_wali_kelas', '=', 'guru.id')
            ->leftJoin('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->select([
                'kelas.id',
                'kelas.id_jurusan as major_id',
                'kelas.id_wali_kelas as homeroom_teacher_id',
                'kelas.tingkat as grade',
                'kelas.rombel as section',
                'kelas.nama_kelas as name',
                'kelas.tahun_ajaran as academic_year',
                'kelas.created_at',
                'jurusan.kode_jurusan as major_code',
                'jurusan.nama_jurusan as major_name',
                'pengguna.nama as homeroom_teacher_name',
                'guru.nip as homeroom_teacher_nip',
                DB::raw('(SELECT COUNT(*) FROM anggota_kelas WHERE anggota_kelas.id_kelas = kelas.id AND anggota_kelas.status = \'aktif\') as students_count'),
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kelas.nama_kelas', 'ilike', "%{$search}%")
                    ->orWhere('jurusan.kode_jurusan', 'ilike', "%{$search}%")
                    ->orWhere('jurusan.nama_jurusan', 'ilike', "%{$search}%")
                    ->orWhere('pengguna.nama', 'ilike', "%{$search}%");
            });
        }

        if (! empty($filters['major_id'])) {
            $query->where('kelas.id_jurusan', $filters['major_id']);
        }

        if (! empty($filters['grade'])) {
            $query->where('kelas.tingkat', $filters['grade']);
        }

        if (! empty($filters['academic_year'])) {
            $query->where('kelas.tahun_ajaran', $filters['academic_year']);
        }

        $sortField = $filters['sort'] ?? 'kelas.nama_kelas';
        $sortDirection = $filters['direction'] ?? 'asc';

        $fieldMap = [
            'name' => 'kelas.nama_kelas',
            'grade' => 'kelas.tingkat',
            'major' => 'jurusan.kode_jurusan',
            'academic_year' => 'kelas.tahun_ajaran',
            'created_at' => 'kelas.created_at',
        ];

        $dbField = $fieldMap[$sortField] ?? 'kelas.nama_kelas';
        $query->orderBy($dbField, $sortDirection);

        return $query->paginate($perPage)->withQueryString();
    }

    public function find(string $id)
    {
        $classroom = DB::table('kelas')
            ->join('jurusan', 'kelas.id_jurusan', '=', 'jurusan.id')
            ->leftJoin('guru', 'kelas.id_wali_kelas', '=', 'guru.id')
            ->leftJoin('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->where('kelas.id', $id)
            ->select([
                'kelas.id',
                'kelas.id_jurusan as major_id',
                'kelas.id_wali_kelas as homeroom_teacher_id',
                'kelas.tingkat as grade',
                'kelas.rombel as section',
                'kelas.nama_kelas as name',
                'kelas.tahun_ajaran as academic_year',
                'kelas.created_at',
                'jurusan.kode_jurusan as major_code',
                'jurusan.nama_jurusan as major_name',
                'pengguna.nama as homeroom_teacher_name',
                'guru.nip as homeroom_teacher_nip',
                DB::raw('(SELECT COUNT(*) FROM anggota_kelas WHERE anggota_kelas.id_kelas = kelas.id AND anggota_kelas.status = \'aktif\') as students_count'),
            ])
            ->first();

        return $classroom;
    }

    public function create(array $data)
    {
        $id = (string) Uuid::v7();
        $majorId = $data['major_id'] ?? $data['id_jurusan'];
        $grade = $data['grade'] ?? $data['tingkat'];
        $section = strtoupper(trim($data['section'] ?? $data['rombel']));
        $academicYear = trim($data['academic_year'] ?? $data['tahun_ajaran']);
        $homeroomTeacherId = $data['homeroom_teacher_id'] ?? $data['id_wali_kelas'] ?? null;

        // Auto-generate name if not provided (e.g., "12 TKJ A")
        $major = DB::table('jurusan')->where('id', $majorId)->first();
        $majorCode = $major ? $major->kode_jurusan : '';
        $name = trim($data['name'] ?? $data['nama_kelas'] ?? "{$grade} {$majorCode} {$section}");

        DB::table('kelas')->insert([
            'id' => $id,
            'id_jurusan' => $majorId,
            'id_wali_kelas' => $homeroomTeacherId,
            'tingkat' => $grade,
            'rombel' => $section,
            'nama_kelas' => $name,
            'tahun_ajaran' => $academicYear,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function update(string $id, array $data)
    {
        $classroom = DB::table('kelas')->where('id', $id)->first();
        if (! $classroom) {
            return;
        }

        $majorId = $data['major_id'] ?? $data['id_jurusan'] ?? $classroom->id_jurusan;
        $grade = $data['grade'] ?? $data['tingkat'] ?? $classroom->tingkat;
        $section = strtoupper(trim($data['section'] ?? $data['rombel'] ?? $classroom->rombel));
        $academicYear = trim($data['academic_year'] ?? $data['tahun_ajaran'] ?? $classroom->tahun_ajaran);
        $homeroomTeacherId = array_key_exists('homeroom_teacher_id', $data)
            ? $data['homeroom_teacher_id']
            : (array_key_exists('id_wali_kelas', $data) ? $data['id_wali_kelas'] : $classroom->id_wali_kelas);

        $major = DB::table('jurusan')->where('id', $majorId)->first();
        $majorCode = $major ? $major->kode_jurusan : '';
        $name = trim($data['name'] ?? $data['nama_kelas'] ?? "{$grade} {$majorCode} {$section}");

        DB::table('kelas')
            ->where('id', $id)
            ->update([
                'id_jurusan' => $majorId,
                'id_wali_kelas' => $homeroomTeacherId,
                'tingkat' => $grade,
                'rombel' => $section,
                'nama_kelas' => $name,
                'tahun_ajaran' => $academicYear,
                'updated_at' => now(),
            ]);
    }

    public function delete(string $id)
    {
        DB::table('kelas')->where('id', $id)->delete();
    }

    public function getAvailableHomeroomTeachers(?string $currentTeacherId = null)
    {
        // Teachers who are not currently homeroom teachers of another class (or are the teacher of the current class)
        $query = DB::table('guru')
            ->join('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->leftJoin('kelas', 'guru.id', '=', 'kelas.id_wali_kelas')
            ->select([
                'guru.id',
                'guru.nip',
                'pengguna.nama as name',
                'pengguna.email',
                'kelas.nama_kelas as current_classroom_name',
            ]);

        if ($currentTeacherId) {
            $query->where(function ($q) use ($currentTeacherId) {
                $q->whereNull('kelas.id_wali_kelas')
                    ->orWhere('guru.id', $currentTeacherId);
            });
        } else {
            $query->whereNull('kelas.id_wali_kelas');
        }

        return $query->orderBy('pengguna.nama', 'asc')->get();
    }
}
