<?php

namespace App\Repositories;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlStudentRepository implements StudentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('siswa')
            ->join('pengguna', 'siswa.id_pengguna', '=', 'pengguna.id')
            ->select([
                'siswa.id',
                'siswa.nisn',
                'siswa.alamat as address',
                'siswa.foto as photo',
                'pengguna.nama as user_name',
                'pengguna.email as user_email',
                'siswa.created_at',
            ]);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('pengguna.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('siswa.nisn', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('pengguna.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'pengguna.nama';
        $sortDirection = $filters['direction'] ?? 'asc';

        $sortFieldMap = [
            'users.name' => 'pengguna.nama',
            'students.nisn' => 'siswa.nisn',
            'students.created_at' => 'siswa.created_at',
        ];

        $dbSortField = $sortFieldMap[$sortField] ?? ($sortFieldMap[$sortField] ?? 'pengguna.nama');
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($student) {
                $student->photo_url = $this->formatPhotoUrl($student->photo);

                return $student;
            });
    }

    public function getAssignableUsers(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('pengguna')
            ->leftJoin('siswa', 'pengguna.id', '=', 'siswa.id_pengguna')
            ->whereNull('siswa.id_pengguna')
            ->where('pengguna.peran', 'siswa')
            ->where('pengguna.disetujui', true)
            ->select(['pengguna.id', 'pengguna.nama as name', 'pengguna.email']);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('pengguna.nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('pengguna.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function find(string $id)
    {
        $student = DB::table('siswa')
            ->where('id', $id)
            ->select([
                'id',
                'id_pengguna as user_id',
                'nisn',
                'alamat as address',
                'foto as photo',
                'created_at',
            ])
            ->first();

        if ($student) {
            $student->user = DB::table('pengguna')
                ->where('id', $student->user_id)
                ->select(['id', 'nama as name', 'email'])
                ->first();

            $student->photo_url = $this->formatPhotoUrl($student->photo);
        }

        return $student;
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

    public function findByUserId(string|int $userId)
    {
        return DB::table('siswa')
            ->where('id_pengguna', $userId)
            ->select([
                'id',
                'id_pengguna as user_id',
                'nisn',
                'alamat as address',
                'foto as photo',
                'created_at',
            ])
            ->first();
    }

    public function create(array $data)
    {
        DB::table('siswa')->insert([
            'id' => (string) Uuid::v7(),
            'id_pengguna' => $data['user_id'],
            'nisn' => $data['nisn'],
            'alamat' => $data['address'],
            'foto' => $data['photo'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(string $id, array $data)
    {
        $updateData = [];

        if (isset($data['nisn'])) {
            $updateData['nisn'] = $data['nisn'];
        }

        if (isset($data['address'])) {
            $updateData['alamat'] = $data['address'];
        }

        if (isset($data['photo'])) {
            $updateData['foto'] = $data['photo'];
        }

        if (! empty($updateData)) {
            $updateData['updated_at'] = now();
            DB::table('siswa')
                ->where('id', $id)
                ->update($updateData);
        }
    }

    public function delete(string $id)
    {
        DB::table('siswa')->where('id', $id)->delete();
    }
}
