<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Major extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'jurusan';

    protected $fillable = [
        'kode_jurusan',
        'nama_jurusan',
        'code',
        'name',
    ];

    protected $appends = [
        'code',
        'name',
    ];

    public function getCodeAttribute(): ?string
    {
        return $this->attributes['kode_jurusan'] ?? null;
    }

    public function setCodeAttribute($value): void
    {
        $this->attributes['kode_jurusan'] = $value;
    }

    public function getNameAttribute(): ?string
    {
        return $this->attributes['nama_jurusan'] ?? null;
    }

    public function setNameAttribute($value): void
    {
        $this->attributes['nama_jurusan'] = $value;
    }

    public function classrooms()
    {
        return $this->hasMany(Classroom::class, 'id_jurusan');
    }
}
