<?php

namespace App\Repositories;

use App\Repositories\Interfaces\SubjectRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\Uid\Uuid;

class SqlSubjectRepository implements SubjectRepositoryInterface
{
    public function create(array $data)
    {
        $code = $this->generateUniqueCode();

        DB::table('mata_pelajaran')->insert([
            'id' => (string) Uuid::v7(),
            'id_guru' => $data['teacher_id'],
            'judul' => $data['title'],
            'kode' => $data['code'] ?? $code,
            'deskripsi' => $data['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (DB::table('mata_pelajaran')->where('kode', $code)->exists());

        return $code;
    }

    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('mata_pelajaran')
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->join('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->select([
                'mata_pelajaran.id',
                'mata_pelajaran.id_guru as teacher_id',
                'guru.id_pengguna as teacher_user_id',
                'mata_pelajaran.judul as title',
                'mata_pelajaran.kode as code',
                'mata_pelajaran.deskripsi as description',
                'mata_pelajaran.created_at',
                'pengguna.nama as teacher_name',
                'pengguna.email as teacher_email',
            ]);

        if (! empty($filters['teacher_id'])) {
            $query->where('mata_pelajaran.id_guru', $filters['teacher_id']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('mata_pelajaran.judul', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('mata_pelajaran.deskripsi', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('pengguna.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('pengguna.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'mata_pelajaran.judul';
        $sortDirection = $filters['direction'] ?? 'asc';

        $sortFieldMap = [
            'subjects.title' => 'mata_pelajaran.judul',
            'subjects.created_at' => 'mata_pelajaran.created_at',
            'users.name' => 'pengguna.nama',
        ];

        $dbSortField = $sortFieldMap[$sortField] ?? ($sortFieldMap[$sortField] ?? 'mata_pelajaran.judul');
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)->withQueryString();
    }

    public function find(string $id)
    {
        return DB::table('mata_pelajaran')
            ->join('guru', 'mata_pelajaran.id_guru', '=', 'guru.id')
            ->join('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->where('mata_pelajaran.id', $id)
            ->select([
                'mata_pelajaran.id',
                'mata_pelajaran.id_guru as teacher_id',
                'guru.id_pengguna as teacher_user_id',
                'mata_pelajaran.judul as title',
                'mata_pelajaran.kode as code',
                'mata_pelajaran.deskripsi as description',
                'mata_pelajaran.created_at',
                'pengguna.nama as teacher_name',
                'pengguna.email as teacher_email',
            ])
            ->first();
    }

    public function update(string $id, array $data)
    {
        $updateData = [
            'id_guru' => $data['teacher_id'],
            'judul' => $data['title'],
            'deskripsi' => $data['description'] ?? null,
            'updated_at' => now(),
        ];

        if (isset($data['code'])) {
            $updateData['kode'] = $data['code'];
        }

        DB::table('mata_pelajaran')
            ->where('id', $id)
            ->update($updateData);
    }

    public function delete(string $id)
    {
        DB::table('mata_pelajaran')
            ->where('id', $id)
            ->delete();
    }

    public function getTeacherSubjects(string $teacherId)
    {
        return DB::table('mata_pelajaran')
            ->where('id_guru', $teacherId)
            ->select(['id', 'judul as title'])
            ->orderBy('judul', 'asc')
            ->get();
    }

    public function getMaterials(string $id)
    {
        return DB::table('materi')
            ->where('id_mata_pelajaran', $id)
            ->select([
                'id',
                'id_mata_pelajaran as subject_id',
                'judul as title',
                'tipe_konten as content_type',
                'isi_konten as content_body',
                'deskripsi as description',
                'created_at',
            ])
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
