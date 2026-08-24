<?php

namespace App\Models;

use App\Policies\TeacherPolicy;
use Database\Factories\TeacherFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_pengguna', 'nip', 'foto', 'bio', 'spesialisasi', 'user_id', 'photo', 'specialization'])]
#[UsePolicy(TeacherPolicy::class)]
class Teacher extends Model
{
    /** @use HasFactory<TeacherFactory> */
    use HasFactory, HasUuids;

    protected $table = 'guru';

    protected $fillable = [
        'id_pengguna',
        'nip',
        'foto',
        'bio',
        'spesialisasi',
        'user_id',
        'photo',
        'specialization',
    ];

    protected $appends = [
        'user_id',
        'photo',
        'specialization',
        'photo_url',
    ];

    // Property compatibility accessors & mutators
    public function getUserIdAttribute()
    {
        return $this->attributes['id_pengguna'] ?? null;
    }

    public function setUserIdAttribute($value): void
    {
        $this->attributes['id_pengguna'] = $value;
    }

    public function getPhotoAttribute(): ?string
    {
        return $this->attributes['foto'] ?? null;
    }

    public function setPhotoAttribute($value): void
    {
        $this->attributes['foto'] = $value;
    }

    public function getSpecializationAttribute(): ?string
    {
        return $this->attributes['spesialisasi'] ?? null;
    }

    public function setSpecializationAttribute($value): void
    {
        $this->attributes['spesialisasi'] = $value;
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::get(function () {
            $foto = $this->attributes['foto'] ?? null;
            if (! $foto) {
                return null;
            }

            if (str_starts_with($foto, 'http://') || str_starts_with($foto, 'https://')) {
                return $foto;
            }

            return url('storage/'.ltrim($foto, '/'));
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_pengguna');
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'id_guru');
    }

    public function exams()
    {
        return $this->hasMany(Exam::class, 'id_guru');
    }
}
