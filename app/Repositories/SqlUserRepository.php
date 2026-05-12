<?php

namespace App\Repositories;

use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Override;

class SqlUserRepository implements UserRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('users')
            ->select([
                'id',
                'name',
                'email',
                'role',
                'is_approved',
                'created_at',
            ]);

        if (! empty($filters['status'])) {
            if ($filters['status'] === 'pending') {
                $query->where('is_approved', false);
            } elseif ($filters['status'] === 'approved') {
                $query->where('is_approved', true);
            }
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('name', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('email', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('role', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'name';
        $sortDirection = $filters['direction'] ?? 'asc';

        $allowedSorts = ['name', 'email', 'role', 'is_approved', 'created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data)
    {
        DB::table('users')->insert([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'role' => $data['role'] ?? 'user',
            'is_approved' => $data['is_approved'] ?? false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(int $id, array $data)
    {
        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'] ?? 'user',
            'is_approved' => $data['is_approved'] ?? false,
            'updated_at' => now(),
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = bcrypt($data['password']);
        }

        DB::table('users')
            ->where('id', $id)
            ->update($updateData);
    }

    public function find(int $id)
    {
        return DB::table('users')
            ->select([
                'id',
                'name',
                'email',
                'role',
                'is_approved',
                'created_at',
            ])
            ->where('id', $id)
            ->first();
    }

    public function delete(int $id)
    {
        DB::table('users')
            ->where('id', $id)
            ->delete();
    }

    public function approve(int $id)
    {
        DB::table('users')
            ->where('id', $id)
            ->update([
                'is_approved' => true,
            ]);
    }
}
