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
            'specialization' => $data['specialization'] ?? null,
            'photo' => $data['photo'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
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
