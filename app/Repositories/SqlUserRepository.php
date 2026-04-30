<?php

namespace App\Repositories;

use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

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
}
