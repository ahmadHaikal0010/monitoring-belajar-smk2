<?php

namespace App\Models;

use App\Policies\AssignmentPolicy;
use Carbon\CarbonInterface;
use Database\Factories\AssignmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable([
    'id_mata_pelajaran',
    'id_guru',
    'judul',
    'deskripsi',
    'tenggat_waktu',
    'skor_maksimal',
    'tipe_berkas_diizinkan',
    'status',
    'subject_id',
    'teacher_id',
    'title',
    'description',
    'due_date',
    'max_score',
    'allowed_file_types',
])]
#[UsePolicy(AssignmentPolicy::class)]
class Assignment extends Model
{
    /** @use HasFactory<AssignmentFactory> */
    use HasFactory, HasUuids;

    protected $table = 'tugas';

    protected $fillable = [
        'id_mata_pelajaran',
        'id_guru',
        'judul',
        'deskripsi',
        'tenggat_waktu',
        'skor_maksimal',
        'tipe_berkas_diizinkan',
        'status',
        'subject_id',
        'teacher_id',
        'title',
        'description',
        'due_date',
        'max_score',
        'allowed_file_types',
    ];

    protected $appends = [
        'subject_id',
        'teacher_id',
        'title',
        'description',
        'due_date',
        'max_score',
        'allowed_file_types',
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

    public function getDescriptionAttribute(): ?string
    {
        return $this->attributes['deskripsi'] ?? null;
    }

    public function setDescriptionAttribute($value): void
    {
        $this->attributes['deskripsi'] = $value;
    }

    public function getDueDateAttribute()
    {
        $val = $this->tenggat_waktu ?? ($this->attributes['tenggat_waktu'] ?? null);
        if (is_null($val)) {
            return null;
        }

        return $val instanceof CarbonInterface ? $val : Carbon::parse($val);
    }

    public function setDueDateAttribute($value): void
    {
        $this->attributes['tenggat_waktu'] = $value;
    }

    public function getMaxScoreAttribute(): ?int
    {
        return isset($this->attributes['skor_maksimal']) ? (int) $this->attributes['skor_maksimal'] : null;
    }

    public function setMaxScoreAttribute($value): void
    {
        $this->attributes['skor_maksimal'] = $value;
    }

    public function getAllowedFileTypesAttribute(): ?array
    {
        $val = $this->attributes['tipe_berkas_diizinkan'] ?? null;

        return is_string($val) ? json_decode($val, true) : $val;
    }

    public function setAllowedFileTypesAttribute($value): void
    {
        $this->attributes['tipe_berkas_diizinkan'] = is_array($value) ? json_encode($value) : $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tenggat_waktu' => 'datetime',
            'skor_maksimal' => 'integer',
            'tipe_berkas_diizinkan' => 'array',
        ];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'id_mata_pelajaran');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'id_guru');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class, 'id_tugas');
    }
}
