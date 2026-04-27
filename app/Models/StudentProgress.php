<?php

namespace App\Models;

use Database\Factories\StudentProgressFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProgress extends Model
{
    /** @use HasFactory<StudentProgressFactory> */
    use HasFactory, HasUuids;
}
