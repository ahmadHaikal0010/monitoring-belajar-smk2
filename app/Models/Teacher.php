<?php

namespace App\Models;

use Database\Factories\TeacherFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    /** @use HasFactory<TeacherFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'nip',
        'specialization',
        'photo',
    ];
}
