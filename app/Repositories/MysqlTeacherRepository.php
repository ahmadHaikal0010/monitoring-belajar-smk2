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

    public function getPaginated($perPage = 10)
    {
        return DB::table('teachers')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->select([
                'teachers.id',
                'teachers.nip',
                'teachers.specialization',
                'teachers.photo',
                'users.name as user_name',
                'users.email as user_email',
                'teachers.created_at',
            ])
            ->orderBy('users.name', 'asc')
            ->paginate($perPage)
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
                ->select('name', 'email', 'created_at')
                ->first();

            $teacher->user = $user;
            $teacher->photo_url = $teacher->photo ? Storage::disk('public')->url($teacher->photo) : null;
        }

        return $teacher;
    }
}
