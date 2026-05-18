<?php

namespace App\Repositories;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SqlStudentRepository implements StudentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('students')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->select([
                'students.id',
                'students.nisn',
                'students.address',
                'students.photo',
                'users.name as user_name',
                'users.email as user_email',
                'students.created_at',
            ]);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('users.name', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('students.nisn', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('users.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'users.name';
        $sortDirection = $filters['direction'] ?? 'asc';

        $allowedSorts = ['users.name', 'students.nisn', 'students.created_at'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('users.name', 'asc');
        }

        return $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($student) {
                $student->photo_url = $student->photo ? Storage::disk('public')->url($student->photo) : null;

                return $student;
            });
    }

    public function getAssignableUsers(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('users')
            ->leftJoin('students', 'users.id', '=', 'students.user_id')
            ->whereNull('students.user_id')
            ->where('users.role', 'siswa')
            ->where('users.is_approved', true)
            ->select(['users.id', 'users.name', 'users.email']);

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('users.name', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('users.email', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        return $query->paginate($perPage)
            ->withQueryString();
    }

    public function find(string $id)
    {
        $student = DB::table('students')->where('id', $id)->first();

        if ($student) {
            $student->user = DB::table('users')
                ->where('id', $student->user_id)
                ->select(['id', 'name', 'email'])
                ->first();

            $student->photo_url = $student->photo ? Storage::disk('public')->url($student->photo) : null;
        }

        return $student;
    }

    public function findByUserId(int $userId)
    {
        return DB::table('students')->where('user_id', $userId)->first();
    }

    public function create(array $data)
    {
        DB::table('students')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $data['user_id'],
            'nisn' => $data['nisn'],
            'address' => $data['address'],
            'photo' => $data['photo'] ?? null,
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
            $updateData['address'] = $data['address'];
        }

        if (isset($data['photo'])) {
            $updateData['photo'] = $data['photo'];
        }

        if (! empty($updateData)) {
            $updateData['updated_at'] = now();
            DB::table('students')
                ->where('id', $id)
                ->update($updateData);
        }
    }

    public function delete(string $id)
    {
        DB::table('students')->where('id', $id)->delete();
    }
}
