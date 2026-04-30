<?php

namespace App\Repositories;

use App\Repositories\Interfaces\SubjectRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SqlSubjectRepository implements SubjectRepositoryInterface
{
    public function create(array $data)
    {
        DB::table('subjects')->insert([
            'id' => Str::uuid(),
            'teacher_id' => $data['teacher_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('subjects')
            ->join('teachers', 'subjects.teacher_id', '=', 'teachers.id')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->select([
                'subjects.id',
                'subjects.teacher_id',
                'subjects.title',
                'subjects.description',
                'subjects.created_at',
                'users.name as teacher_name',
                'users.email as teacher_email',
            ]);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('subjects.title', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('subjects.description', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('users.name', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('users.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'subjects.title';
        $sortDirection = $filters['direction'] ?? 'asc';

        $allowedSorts = ['subjects.title', 'subjects.created_at', 'users.name'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('subjects.title', 'asc');
        }

        return $query->paginate($perPage)->withQueryString();
    }
}
