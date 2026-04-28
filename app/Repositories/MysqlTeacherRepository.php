<?php

namespace App\Repositories;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MysqlTeacherRepository implements TeacherRepositoryInterface
{
    public function create(array $data)
    {
        DB::table('teachers')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $data['user_id'],
            'nip' => $data['nip'],
            'photo' => $data['photo'] ?? null,
            'bio' => $data['bio'] ?? null,
            'specialization' => $data['specialization'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function update($id, array $data)
    {
        $updateData = [
            'bio' => $data['bio'] ?? null,
            'specialization' => $data['specialization'] ?? null,
            'updated_at' => now(),
        ];

        if (isset($data['photo'])) {
            $updateData['photo'] = $data['photo'];
        }

        DB::table('teachers')
            ->where('id', $id)
            ->update($updateData);
    }

    public function getPaginated(array $filters = [], $perPage = 10)
    {
        $query = DB::table('teachers')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->select([
                'teachers.id',
                'teachers.nip',
                'teachers.specialization',
                'teachers.photo',
                'users.name as user_name',
                'users.email as user_email',
                'teachers.created_at',
            ]);

        // Fitur Searching
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('users.name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('teachers.nip', 'like', '%'.$filters['search'].'%')
                    ->orWhere('teachers.specialization', 'like', '%'.$filters['search'].'%')
                    ->orWhere('users.email', 'like', '%'.$filters['search'].'%');
            });
        }

        // Fitur Sorting
        $sortField = $filters['sort'] ?? 'users.name';
        $sortDirection = $filters['direction'] ?? 'asc';

        // Memastikan field yang di-sort valid (security)
        $allowedSorts = ['users.name', 'teachers.nip', 'teachers.created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('users.name', 'asc');
        }

        return $query->paginate($perPage)
            ->withQueryString() // Agar parameter ?search=... tidak hilang saat pindah halaman
            ->through(function ($teacher) {
                // Menambahkan URL foto secara on-the-fly
                $teacher->photo_url = $teacher->photo ? Storage::disk('public')->url($teacher->photo) : null;

                return $teacher;
            });
    }

    public function getByUserId($userId)
    {
        $teacher = DB::table('teachers')
            ->where('user_id', $userId)
            ->first();

        if ($teacher) {
            $user = DB::table('users')
                ->where('id', $userId)
                ->select(['name', 'email', 'created_at'])
                ->first();

            $teacher->user = $user;
            $teacher->photo_url = $teacher->photo ? Storage::disk('public')->url($teacher->photo) : null;
        }

        return $teacher;
    }

    public function getAssignableUsers(array $filter = [], int $perPage = 10)
    {
        $query = DB::table('users')
            ->leftJoin('teachers', 'users.id', '=', 'teachers.user_id')
            ->whereNull('teachers.user_id') // Hanya ambil user yang belum jadi guru
            ->where('users.role', 'guru')
            ->where('users.is_approved', true)
            ->select(['users.id', 'users.name', 'users.email']);

        if (! empty($filter['search'])) {
            $query->where(function ($q) use ($filter) {
                $q->where('users.name', 'like', '%'.$filter['search'].'%')
                    ->orWhere('users.email', 'like', '%'.$filter['search'].'%');
            });
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }
}
