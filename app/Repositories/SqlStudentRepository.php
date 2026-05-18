<?php

namespace App\Repositories;

use App\Repositories\Interfaces\StudentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class SqlStudentRepository implements StudentRepositoryInterface
{
    public function find(string $id)
    {
        return DB::table('students')->where('id', $id)->first();
    }

    public function findByUserId(int $userId)
    {
        return DB::table('students')->where('user_id', $userId)->first();
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
}
