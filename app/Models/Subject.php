<?php

namespace App\Models;

use App\Policies\SubjectPolicy;
use Database\Factories\SubjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_guru', 'judul', 'kode', 'deskripsi', 'teacher_id', 'title', 'description', 'code'])]
#[UsePolicy(SubjectPolicy::class)]
class Subject extends Model
{
    /** @use HasFactory<SubjectFactory> */
    use HasFactory, HasUuids;

    protected $table = 'mata_pelajaran';

    protected $fillable = [
        'id_guru',
        'judul',
        'kode',
        'deskripsi',
        'teacher_id',
        'title',
        'code',
        'description',
    ];

    protected $appends = [
        'teacher_id',
        'title',
        'code',
        'description',
    ];

    // Property compatibility accessors & mutators
    public function getTeacherIdAttribute(): ?string
    {
        return $this->attributes['id_guru'] ?? null;
    }

    public function setTeacherIdAttribute($value): void
    {
        $this->attributes['id_guru'] = $value;
    }

    public function getTitleAttribute(): ?string
    {
        return $this->attributes['judul'] ?? null;
    }

    public function setTitleAttribute($value): void
    {
        $this->attributes['judul'] = $value;
    }

    public function getCodeAttribute(): ?string
    {
        return $this->attributes['kode'] ?? null;
    }

    public function setCodeAttribute($value): void
    {
        $this->attributes['kode'] = $value;
    }

    public function getDescriptionAttribute(): ?string
    {
        return $this->attributes['deskripsi'] ?? null;
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['deskripsi'] = $value;
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'id_guru');
    }

    public function materials()
    {
        return $this->hasMany(Material::class, 'id_mata_pelajaran');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class, 'id_mata_pelajaran');
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'id_mata_pelajaran');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'id_mata_pelajaran');
    }

    public function classrooms()
    {
        return $this->belongsToMany(Classroom::class, 'kelas_mata_pelajaran', 'id_mata_pelajaran', 'id_kelas')
            ->withTimestamps();
    }
}
