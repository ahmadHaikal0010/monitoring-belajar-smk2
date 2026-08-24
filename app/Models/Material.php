<?php

namespace App\Models;

use App\Policies\MaterialPolicy;
use Database\Factories\MaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'id_mata_pelajaran',
    'judul',
    'tipe_konten',
    'isi_konten',
    'deskripsi',
    'subject_id',
    'title',
    'content_type',
    'content_body',
    'description',
])]
#[UsePolicy(MaterialPolicy::class)]
class Material extends Model
{
    /** @use HasFactory<MaterialFactory> */
    use HasFactory, HasUuids;

    protected $table = 'materi';

    protected $fillable = [
        'id_mata_pelajaran',
        'judul',
        'tipe_konten',
        'isi_konten',
        'deskripsi',
        'subject_id',
        'title',
        'content_type',
        'content_body',
        'description',
    ];

    protected $appends = [
        'subject_id',
        'title',
        'content_type',
        'content_body',
        'description',
    ];

    // Property compatibility accessors & mutators
    public function getSubjectIdAttribute(): ?string
    {
        return $this->attributes['id_mata_pelajaran'] ?? null;
    }

    public function setSubjectIdAttribute($value): void
    {
        $this->attributes['id_mata_pelajaran'] = $value;
    }

    public function getTitleAttribute(): ?string
    {
        return $this->attributes['judul'] ?? null;
    }

    public function setTitleAttribute($value): void
    {
        $this->attributes['judul'] = $value;
    }

    public function getContentTypeAttribute(): ?string
    {
        return $this->attributes['tipe_konten'] ?? null;
    }

    public function setContentTypeAttribute($value): void
    {
        $this->attributes['tipe_konten'] = $value;
    }

    public function getContentBodyAttribute(): ?string
    {
        return $this->attributes['isi_konten'] ?? null;
    }

    public function setContentBodyAttribute($value): void
    {
        $this->attributes['isi_konten'] = $value;
    }

    public function getDescriptionAttribute(): ?string
    {
        return $this->attributes['deskripsi'] ?? null;
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['deskripsi'] = $value;
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'id_mata_pelajaran');
    }

    public function progress()
    {
        return $this->hasMany(StudentProgress::class, 'id_materi');
    }
}
