<?php

namespace App\Repositories;

use App\Repositories\Interfaces\TeacherRepositoryInterface;
use Illuminate\Support\Facades\DB;
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
        return DB::table('teachers')->where('user_id', $userId)->first();
    }
}
