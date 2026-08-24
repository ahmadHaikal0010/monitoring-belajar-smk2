<?php

namespace App\Models;

use Database\Factories\EnrollmentFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    /** @use HasFactory<EnrollmentFactory> */
    use HasFactory, HasUuids;

    protected $table = 'pendaftaran';

    protected $fillable = [
        'id_siswa',
        'id_mata_pelajaran',
        'status',
        'terdaftar_pada',
        'student_id',
        'subject_id',
        'enrolled_at',
    ];

    protected $appends = [
        'student_id',
        'subject_id',
        'enrolled_at',
    ];

    // Property compatibility accessors & mutators
    public function getStudentIdAttribute(): ?string
    {
        return $this->attributes['id_siswa'] ?? null;
    }

    public function setStudentIdAttribute($value): void
    {
        $this->attributes['id_siswa'] = $value;
    }

    public function getSubjectIdAttribute(): ?string
    {
        return $this->attributes['id_mata_pelajaran'] ?? null;
    }

    public function setSubjectIdAttribute($value): void
    {
        $this->attributes['id_mata_pelajaran'] = $value;
    }

    public function getEnrolledAtAttribute()
    {
        return $this->attributes['terdaftar_pada'] ?? null;
    }

    public function setEnrolledAtAttribute($value): void
    {
        $this->attributes['terdaftar_pada'] = $value;
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'id_siswa');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'id_mata_pelajaran');
    }

    public function progress()
    {
        return $this->hasMany(StudentProgress::class, 'id_pendaftaran');
    }
}
