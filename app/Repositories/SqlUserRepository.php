<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlUserRepository implements UserRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('pengguna')
            ->select([
                'id',
                'nama as name',
                'email',
                'peran as role',
                'disetujui as is_approved',
                'created_at',
            ]);

        if (! empty($filters['status'])) {
            if ($filters['status'] === 'pending') {
                $query->where('disetujui', false);
            } elseif ($filters['status'] === 'approved') {
                $query->where('disetujui', true);
            }
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('nama', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('email', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('peran', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortFieldMap = [
            'name' => 'nama',
            'email' => 'email',
            'role' => 'peran',
            'is_approved' => 'disetujui',
            'created_at' => 'created_at',
        ];

        $sortField = $filters['sort'] ?? 'name';
        $sortDirection = $filters['direction'] ?? 'asc';

        $dbSortField = $sortFieldMap[$sortField] ?? 'nama';
        $query->orderBy($dbSortField, $sortDirection);

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data)
    {
        DB::table('pengguna')->insert([
            'nama' => $data['name'],
            'email' => $data['email'],
            'kata_sandi' => bcrypt($data['password']),
            'peran' => $data['role'] ?? 'siswa',
            'disetujui' => $data['is_approved'] ?? false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(int $id, array $data)
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['nama'] = $data['name'];
        }

        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        if (isset($data['role'])) {
            $updateData['peran'] = $data['role'];
        }

        if (isset($data['is_approved'])) {
            $updateData['disetujui'] = $data['is_approved'];
        }

        if (! empty($data['password'])) {
            $updateData['kata_sandi'] = bcrypt($data['password']);
        }

        if (! empty($updateData)) {
            $updateData['updated_at'] = now();
            DB::table('pengguna')
                ->where('id', $id)
                ->update($updateData);
        }
    }

    public function find(int $id)
    {
        return DB::table('pengguna')
            ->select([
                'id',
                'nama as name',
                'email',
                'peran as role',
                'disetujui as is_approved',
                'created_at',
            ])
            ->where('id', $id)
            ->first();
    }

    public function delete(int $id)
    {
        DB::table('pengguna')
            ->where('id', $id)
            ->delete();
    }

    public function approve(int $id)
    {
        DB::table('pengguna')
            ->where('id', $id)
            ->update([
                'disetujui' => true,
            ]);
    }

    public function authenticate(string $email)
    {
        $userRaw = DB::table('pengguna')
            ->where('email', $email)
            ->first();

        if (! $userRaw) {
            return null;
        }

        return User::hydrate([(array) $userRaw])->first();
    }

    public function register(array $data)
    {
        DB::transaction(function () use ($data) {
            $userId = DB::table('pengguna')->insertGetId([
                'nama' => $data['name'],
                'email' => $data['email'],
                'kata_sandi' => bcrypt($data['password']),
                'peran' => 'siswa',
                'disetujui' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('siswa')->insert([
                'id' => (string) Uuid::v7(),
                'id_pengguna' => $userId,
                'nisn' => $data['nisn'],
                'alamat' => $data['address'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }
}
