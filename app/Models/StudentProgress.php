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

    protected $table = 'student_progress';

    protected $fillable = [
        'enrollment_id',
        'material_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function material()
    {
        return $this->belongsTo(Material::class);
    }
}
