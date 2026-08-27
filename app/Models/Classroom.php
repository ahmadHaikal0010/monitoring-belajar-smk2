<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classroom extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'kelas';

    protected $fillable = [
        'id_jurusan',
        'id_wali_kelas',
        'tingkat',
        'rombel',
        'nama_kelas',
        'tahun_ajaran',
        'major_id',
        'homeroom_teacher_id',
        'grade',
        'section',
        'name',
        'academic_year',
    ];

    protected $appends = [
        'major_id',
        'homeroom_teacher_id',
        'grade',
        'section',
        'name',
        'academic_year',
    ];

    public function getMajorIdAttribute()
    {
        return $this->attributes['id_jurusan'] ?? null;
    }

    public function setMajorIdAttribute($value): void
    {
        $this->attributes['id_jurusan'] = $value;
    }

    public function getHomeroomTeacherIdAttribute()
    {
        return $this->attributes['id_wali_kelas'] ?? null;
    }

    public function setHomeroomTeacherIdAttribute($value): void
    {
        $this->attributes['id_wali_kelas'] = $value;
    }

    public function getGradeAttribute()
    {
        return $this->attributes['tingkat'] ?? null;
    }

    public function setGradeAttribute($value): void
    {
        $this->attributes['tingkat'] = $value;
    }

    public function getSectionAttribute()
    {
        return $this->attributes['rombel'] ?? null;
    }

    public function setSectionAttribute($value): void
    {
        $this->attributes['rombel'] = $value;
    }

    public function getNameAttribute()
    {
        return $this->attributes['nama_kelas'] ?? null;
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['nama_kelas'] = $value;
    }

    public function getAcademicYearAttribute()
    {
        return $this->attributes['tahun_ajaran'] ?? null;
    }

    public function setAcademicYearAttribute($value): void
    {
        $this->attributes['tahun_ajaran'] = $value;
    }

    public function major()
    {
        return $this->belongsTo(Major::class, 'id_jurusan');
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(Teacher::class, 'id_wali_kelas');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'anggota_kelas', 'id_kelas', 'id_siswa')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function enrollments()
    {
        return $this->hasMany(ClassEnrollment::class, 'id_kelas');
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'kelas_mata_pelajaran', 'id_kelas', 'id_mata_pelajaran')
            ->withTimestamps();
    }
}
