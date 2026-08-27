<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassEnrollment extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'anggota_kelas';

    protected $fillable = [
        'id_kelas',
        'id_siswa',
        'status',
        'classroom_id',
        'student_id',
    ];

    protected $appends = [
        'classroom_id',
        'student_id',
    ];

    public function getClassroomIdAttribute()
    {
        return $this->attributes['id_kelas'] ?? null;
    }

    public function setClassroomIdAttribute($value): void
    {
        $this->attributes['id_kelas'] = $value;
    }

    public function getStudentIdAttribute()
    {
        return $this->attributes['id_siswa'] ?? null;
    }

    public function setStudentIdAttribute($value): void
    {
        $this->attributes['id_siswa'] = $value;
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class, 'id_kelas');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'id_siswa');
    }
}
