<?php

namespace App\Repositories;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlTeacherRepository implements TeacherRepositoryInterface
{
    public function create(array $data)
    {
        DB::table('guru')->insert([
            'id' => (string) Uuid::v7(),
            'id_pengguna' => $data['user_id'],
            'nip' => $data['nip'],
            'foto' => $data['photo'] ?? null,
            'bio' => $data['bio'] ?? null,
            'spesialisasi' => $data['specialization'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(string $id, array $data)
    {
        $teacher = DB::table('guru')->where('id', $id)->first();

        $updateData = [
            'id_pengguna' => $data['user_id'] ?? $teacher->id_pengguna,
            'nip' => $data['nip'] ?? $teacher->nip,
            'bio' => $data['bio'] ?? null,
            'spesialisasi' => $data['specialization'] ?? null,
            'updated_at' => now(),
        ];

        if (isset($data['photo'])) {
            $updateData['foto'] = $data['photo'];
        }

        DB::table('guru')
            ->where('id', $id)
            ->update($updateData);
    }

    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $query = DB::table('guru')
            ->join('pengguna', 'guru.id_pengguna', '=', 'pengguna.id')
            ->select([
                'guru.id',
                'guru.nip',
                'guru.spesialisasi as specialization',
                'guru.foto as photo',
                'pengguna.nama as user_name',
                'pengguna.email as user_email',
                'guru.created_at',
            ]);

        // Fitur Searching
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('pengguna.nama', 'ilike', '%'.$filters['search'].'%')
                    ->orWhere('guru.nip', 'ilike', '%'.$filters['search'].'%')
                    ->orWhere('guru.spesialisasi', 'ilike', '%'.$filters['search'].'%')
                    ->orWhere('pengguna.email', 'ilike', '%'.$filters['search'].'%');
            });
        }

        // Fitur Sorting
        $sortField = $filters['sort'] ?? 'pengguna.nama';
        $sortDirection = $filters['direction'] ?? 'asc';

        $sortFieldMap = [
            'users.name' => 'pengguna.nama',
            'teachers.nip' => 'guru.nip',
            'teachers.created_at' => 'guru.created_at',
        ];

        $dbSortField = $sortFieldMap[$sortField] ?? ($sortFieldMap[$sortField] ?? 'pengguna.nama');
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($teacher) {
                $teacher->photo_url = $this->formatPhotoUrl($teacher->photo);

                return $teacher;
            });
    }

    public function getByUserId(string|int $userId)
    {
        $teacher = DB::table('guru')
            ->where('id_pengguna', $userId)
            ->select([
                'id',
                'id_pengguna as user_id',
                'nip',
                'foto as photo',
                'bio',
                'spesialisasi as specialization',
                'created_at',
            ])
            ->first();

        if ($teacher) {
            $user = DB::table('pengguna')
                ->where('id', $userId)
                ->select(['nama as name', 'email', 'created_at'])
                ->first();

            $teacher->user = $user;
            $teacher->photo_url = $this->formatPhotoUrl($teacher->photo);
        }

        return $teacher;
    }

    public function getAssignableUsers(array $filter = [], int $perPage = 10)
    {
        $query = DB::table('pengguna')
            ->leftJoin('guru', 'pengguna.id', '=', 'guru.id_pengguna')
            ->whereNull('guru.id_pengguna')
            ->where('pengguna.peran', 'guru')
            ->where('pengguna.disetujui', true)
            ->select(['pengguna.id', 'pengguna.nama as name', 'pengguna.email']);

        if (! empty($filter['search'])) {
            $query->where(function ($q) use ($filter) {
                $q->where('pengguna.nama', 'ilike', '%'.$filter['search'].'%')
                    ->orWhere('pengguna.email', 'ilike', '%'.$filter['search'].'%');
            });
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function find(string $id)
    {
        $teacher = DB::table('guru')
            ->where('id', $id)
            ->select([
                'id',
                'id_pengguna as user_id',
                'nip',
                'foto as photo',
                'bio',
                'spesialisasi as specialization',
                'created_at',
            ])
            ->first();

        if ($teacher) {
            $teacher->user = DB::table('pengguna')
                ->where('id', $teacher->user_id)
                ->select(['id', 'nama as name', 'email'])
                ->first();

            $teacher->photo_url = $this->formatPhotoUrl($teacher->photo);
        }

        return $teacher;
    }

    private function formatPhotoUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        return url('storage/'.ltrim($path, '/'));
    }

    public function delete(string $id)
    {
        DB::table('guru')->where('id', $id)->delete();
    }
}
