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

    protected $table = 'progres_siswa';

    protected $fillable = [
        'id_pendaftaran',
        'id_materi',
        'selesai',
        'diselesaikan_pada',
        'enrollment_id',
        'material_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'selesai' => 'boolean',
        'diselesaikan_pada' => 'datetime',
    ];

    protected $appends = [
        'enrollment_id',
        'material_id',
        'is_completed',
        'completed_at',
    ];

    // Property compatibility accessors & mutators
    public function getEnrollmentIdAttribute(): ?string
    {
        return $this->attributes['id_pendaftaran'] ?? null;
    }

    public function setEnrollmentIdAttribute($value): void
    {
        $this->attributes['id_pendaftaran'] = $value;
    }

    public function getMaterialIdAttribute(): ?string
    {
        return $this->attributes['id_materi'] ?? null;
    }

    public function setMaterialIdAttribute($value): void
    {
        $this->attributes['id_materi'] = $value;
    }

    public function getIsCompletedAttribute(): bool
    {
        return (bool) ($this->attributes['selesai'] ?? false);
    }

    public function setIsCompletedAttribute($value): void
    {
        $this->attributes['selesai'] = (bool) $value;
    }

    public function getCompletedAtAttribute()
    {
        return $this->attributes['diselesaikan_pada'] ?? null;
    }

    public function setCompletedAtAttribute($value): void
    {
        $this->attributes['diselesaikan_pada'] = $value;
    }

    public function enrollment()
    {
        return $this->belongsTo(Enrollment::class, 'id_pendaftaran');
    }

    public function material()
    {
        return $this->belongsTo(Material::class, 'id_materi');
    }
}
