<?php

namespace App\Repositories;

use App\Repositories\Interfaces\MaterialRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
                'materials.subject_id',
                'materials.title',
                'materials.content_type',
                'materials.content_body',
                'materials.description',
                'materials.created_at',
                'subjects.title as subject_title',
                'subjects.teacher_id',
            ])
            ->join('teachers', 'subjects.teacher_id', '=', 'teachers.id')
            ->addSelect(['teachers.user_id as teacher_user_id']);

        if (! empty($filters['subject_id'])) {
            $query->where('materials.subject_id', $filters['subject_id']);
        }

        if (! empty($filters['teacher_id'])) {
            $query->where('subjects.teacher_id', $filters['teacher_id']);
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
            ->withQueryString()
            ->through(function ($material) {
                if (in_array($material->content_type, ['video', 'document']) && $material->content_body) {
                    $material->content_body_url = Storage::disk('public')->url($material->content_body);
                } else {
                    $material->content_body_url = null;
                }

                return $material;
            });
    }

    public function find(string $id)
    {
        $material = DB::table('materials')
            ->join('subjects', 'materials.subject_id', '=', 'subjects.id')
            ->where('materials.id', $id)
            ->select([
                'materials.id',
                'materials.subject_id',
                'materials.title',
                'materials.content_type',
                'materials.content_body',
                'materials.description',
                'materials.created_at',
                'subjects.title as subject_title',
                'subjects.teacher_id',
            ])
            ->first();

        if ($material && in_array($material->content_type, ['video', 'document']) && $material->content_body) {
            $material->content_body_url = Storage::disk('public')->url($material->content_body);
        } else {
            if ($material) {
                $material->content_body_url = null;
            }
        }

        return $material;
    }

    public function create(array $data)
    {
        DB::table('materials')->insert([
            'id' => (string) Str::uuid(),
            'subject_id' => $data['subject_id'],
            'title' => $data['title'],
            'content_type' => $data['content_type'],
            'content_body' => $data['content_body'],
            'description' => $data['description'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update(string $id, array $data)
    {
        DB::table('materials')
            ->where('id', $id)
            ->update([
                'title' => $data['title'],
                'content_type' => $data['content_type'],
                'content_body' => $data['content_body'],
                'description' => $data['description'] ?? null,
                'updated_at' => now(),
            ]);
    }

    public function delete(string $id)
    {
        DB::table('materials')
            ->where('id', $id)
            ->delete();
    }
}
