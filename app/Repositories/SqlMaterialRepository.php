<?php

namespace App\Repositories;

use App\Repositories\Interfaces\MaterialRepositoryInterface;
use Illuminate\Support\Facades\DB;

class SqlMaterialRepository implements MaterialRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('materials')
            ->join('subjects', 'materials.subject_id', '=', 'subjects.id')
            ->select([
                'materials.id',
                'materials.title',
                'materials.content_type',
                'materials.content_body',
                'materials.description',
                'materials.created_at',
                'subjects.title as subject_title',
            ]);

        if (! empty($filters['subject_id'])) {
            $query->where('materials.subject_id', $filters['subject_id']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('materials.title', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('materials.content_type', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('subjects.title', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('materials.description', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'materials.created_at';
        $sortDirection = $filters['direction'] ?? 'desc';

        $allowedSorts = [
            'title' => 'materials.title',
            'type' => 'materials.content_type',
            'subject' => 'subjects.title',
            'date' => 'materials.created_at',
        ];

        if (array_key_exists($sortField, $allowedSorts)) {
            $query->orderBy($allowedSorts[$sortField], $sortDirection);
        } else {
            $query->orderBy('materials.created_at', 'desc');
        }

        return $query
            ->paginate($perPage)
            ->withQueryString();
    }

    public function find(string $id)
    {
        return DB::table('materials')
            ->join('subjects', 'materials.subject_id', '=', 'subjects.id')
            ->where('materials.id', $id)
            ->select([
                'materials.id',
                'materials.title',
                'materials.content_type',
                'materials.content_body',
                'materials.description',
                'materials.created_at',
                'subjects.title as subject_title',
            ])
            ->first();
    }
}
