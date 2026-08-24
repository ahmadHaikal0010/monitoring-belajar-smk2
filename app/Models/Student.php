<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_pengguna', 'nisn', 'foto', 'alamat', 'user_id', 'address', 'photo'])]
class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory, HasUuids;

    protected $table = 'siswa';

    protected $fillable = [
        'id_pengguna',
        'nisn',
        'foto',
        'alamat',
        'user_id',
        'photo',
        'address',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'user_id',
        'photo',
        'address',
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

    public function getAddressAttribute(): ?string
    {
        return $this->attributes['alamat'] ?? null;
    }

    public function setAddressAttribute($value): void
    {
        $this->attributes['alamat'] = $value;
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_pengguna');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'id_siswa');
    }

    /**
     * Get the full URL for the student's photo.
     */
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

    public function examSessions()
    {
        return $this->hasMany(ExamSession::class, 'id_siswa');
    }
}
