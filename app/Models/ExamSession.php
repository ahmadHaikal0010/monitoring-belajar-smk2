<?php

namespace App\Models;

use Database\Factories\ExamSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id_ujian',
    'id_siswa',
    'dimulai_pada',
    'dikumpulkan_pada',
    'total_skor',
    'status',
    'exam_id',
    'student_id',
    'started_at',
    'submitted_at',
    'total_score',
])]
class ExamSession extends Model
{
    /** @use HasFactory<ExamSessionFactory> */
    use HasFactory, HasUuids;

    protected $table = 'sesi_ujian';

    protected $fillable = [
        'id_ujian',
        'id_siswa',
        'dimulai_pada',
        'dikumpulkan_pada',
        'total_skor',
        'status',
        'exam_id',
        'student_id',
        'started_at',
        'submitted_at',
        'total_score',
    ];

    protected $appends = [
        'exam_id',
        'student_id',
        'started_at',
        'submitted_at',
        'total_score',
    ];

    // Property compatibility accessors & mutators
    public function getExamIdAttribute(): ?string
    {
        return $this->attributes['id_ujian'] ?? null;
    }

    public function setExamIdAttribute($value): void
    {
        $this->attributes['id_ujian'] = $value;
    }

    public function getStudentIdAttribute(): ?string
    {
        return $this->attributes['id_siswa'] ?? null;
    }

    public function setStudentIdAttribute($value): void
    {
        $this->attributes['id_siswa'] = $value;
    }

    public function getStartedAtAttribute()
    {
        return $this->attributes['dimulai_pada'] ?? null;
    }

    public function setStartedAtAttribute($value): void
    {
        $this->attributes['dimulai_pada'] = $value;
    }

    public function getSubmittedAtAttribute()
    {
        return $this->attributes['dikumpulkan_pada'] ?? null;
    }

    public function setSubmittedAtAttribute($value): void
    {
        $this->attributes['dikumpulkan_pada'] = $value;
    }

    public function getTotalScoreAttribute(): ?float
    {
        return isset($this->attributes['total_skor']) ? (float) $this->attributes['total_skor'] : null;
    }

    public function setTotalScoreAttribute($value): void
    {
        $this->attributes['total_skor'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dimulai_pada' => 'datetime',
            'dikumpulkan_pada' => 'datetime',
            'total_skor' => 'float',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'id_ujian');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'id_siswa');
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class, 'id_sesi_ujian');
    }
}
