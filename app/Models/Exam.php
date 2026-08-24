<?php

namespace App\Models;

use App\Policies\ExamPolicy;
use Database\Factories\ExamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id_mata_pelajaran',
    'id_guru',
    'judul',
    'deskripsi',
    'durasi',
    'nilai_kkm',
    'acak_soal',
    'acak_opsi',
    'status',
    'waktu_mulai',
    'waktu_selesai',
    'subject_id',
    'teacher_id',
    'title',
    'description',
    'duration',
    'pass_score',
    'randomize_questions',
    'randomize_options',
    'start_time',
    'end_time',
])]
#[UsePolicy(ExamPolicy::class)]
class Exam extends Model
{
    /** @use HasFactory<ExamFactory> */
    use HasFactory, HasUuids;

    protected $table = 'ujian';

    protected $fillable = [
        'id_mata_pelajaran',
        'id_guru',
        'judul',
        'deskripsi',
        'durasi',
        'nilai_kkm',
        'acak_soal',
        'acak_opsi',
        'status',
        'waktu_mulai',
        'waktu_selesai',
        'subject_id',
        'teacher_id',
        'title',
        'description',
        'duration',
        'pass_score',
        'randomize_questions',
        'randomize_options',
        'start_time',
        'end_time',
    ];

    protected $appends = [
        'subject_id',
        'teacher_id',
        'title',
        'description',
        'duration',
        'pass_score',
        'randomize_questions',
        'randomize_options',
        'start_time',
        'end_time',
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

    public function getDurationAttribute(): ?int
    {
        return $this->attributes['durasi'] ?? null;
    }

    public function setDurationAttribute($value): void
    {
        $this->attributes['durasi'] = $value;
    }

    public function getPassScoreAttribute(): ?int
    {
        return $this->attributes['nilai_kkm'] ?? null;
    }

    public function setPassScoreAttribute($value): void
    {
        $this->attributes['nilai_kkm'] = $value;
    }

    public function getRandomizeQuestionsAttribute(): bool
    {
        return (bool) ($this->attributes['acak_soal'] ?? false);
    }

    public function setRandomizeQuestionsAttribute($value): void
    {
        $this->attributes['acak_soal'] = (bool) $value;
    }

    public function getRandomizeOptionsAttribute(): bool
    {
        return (bool) ($this->attributes['acak_opsi'] ?? false);
    }

    public function setRandomizeOptionsAttribute($value): void
    {
        $this->attributes['acak_opsi'] = (bool) $value;
    }

    public function getStartTimeAttribute()
    {
        return $this->attributes['waktu_mulai'] ?? null;
    }

    public function setStartTimeAttribute($value): void
    {
        $this->attributes['waktu_mulai'] = $value;
    }

    public function getEndTimeAttribute()
    {
        return $this->attributes['waktu_selesai'] ?? null;
    }

    public function setEndTimeAttribute($value): void
    {
        $this->attributes['waktu_selesai'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'durasi' => 'integer',
            'nilai_kkm' => 'integer',
            'acak_soal' => 'boolean',
            'acak_opsi' => 'boolean',
            'waktu_mulai' => 'datetime',
            'waktu_selesai' => 'datetime',
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

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'id_ujian')->orderBy('urutan');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class, 'id_ujian');
    }
}
