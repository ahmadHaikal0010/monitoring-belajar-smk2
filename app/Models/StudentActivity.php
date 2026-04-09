<?php

namespace App\Models;

use Database\Factories\StudentActivityFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentActivity extends Model
{
    /** @use HasFactory<StudentActivityFactory> */
    use HasFactory, HasUuids;
}
