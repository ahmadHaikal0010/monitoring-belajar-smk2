<?php

namespace App\Repositories;

use App\Repositories\Interfaces\SubjectRepositoryInterface;
use Illuminate\Support\Facades\DB;

class MysqlSubjectRepository implements SubjectRepositoryInterface
{
    public function create(array $data)
    {
        DB::table('subjects')->insert([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
