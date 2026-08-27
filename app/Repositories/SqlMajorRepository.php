<?php

namespace App\Repositories;

use App\Repositories\Interfaces\MajorRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Uid\Uuid;

class SqlMajorRepository implements MajorRepositoryInterface
{
    public function getAll()
    {
        return DB::table('jurusan')
            ->select([
                'id',
                'kode_jurusan as code',
                'nama_jurusan as name',
                'created_at',
            ])
            ->orderBy('kode_jurusan', 'asc')
            ->get();
    }

    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $query = DB::table('jurusan')
            ->select([
                'id',
                'kode_jurusan as code',
                'nama_jurusan as name',
                'created_at',
            ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('kode_jurusan', 'ilike', "%{$search}%")
                    ->orWhere('nama_jurusan', 'ilike', "%{$search}%");
            });
        }

        $sortField = $filters['sort'] ?? 'kode_jurusan';
        $sortDirection = $filters['direction'] ?? 'asc';

        $fieldMap = [
            'code' => 'kode_jurusan',
            'name' => 'nama_jurusan',
            'created_at' => 'created_at',
        ];

        $dbField = $fieldMap[$sortField] ?? 'kode_jurusan';
        $query->orderBy($dbField, $sortDirection);

        return $query->paginate($perPage)->withQueryString();
    }

    public function find(string $id)
    {
        return DB::table('jurusan')
            ->where('id', $id)
            ->select([
                'id',
                'kode_jurusan as code',
                'nama_jurusan as name',
                'created_at',
            ])
            ->first();
    }

    public function findByCode(string $code)
    {
        return DB::table('jurusan')
            ->where('kode_jurusan', $code)
            ->select([
                'id',
                'kode_jurusan as code',
                'nama_jurusan as name',
                'created_at',
            ])
            ->first();
    }

    public function create(array $data)
    {
        $id = (string) Uuid::v7();
        DB::table('jurusan')->insert([
            'id' => $id,
            'kode_jurusan' => strtoupper(trim($data['code'] ?? $data['kode_jurusan'])),
            'nama_jurusan' => trim($data['name'] ?? $data['nama_jurusan']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $id;
    }

    public function update(string $id, array $data)
    {
        DB::table('jurusan')
            ->where('id', $id)
            ->update([
                'kode_jurusan' => strtoupper(trim($data['code'] ?? $data['kode_jurusan'])),
                'nama_jurusan' => trim($data['name'] ?? $data['nama_jurusan']),
                'updated_at' => now(),
            ]);
    }

    public function delete(string $id)
    {
        DB::table('jurusan')->where('id', $id)->delete();
    }
}
