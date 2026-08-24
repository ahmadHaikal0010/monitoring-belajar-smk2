<?php

namespace App\Models;

use Database\Factories\StudentAnswerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'id_sesi_ujian',
    'id_soal',
    'id_opsi_dipilih',
    'jawaban_esai',
    'benar',
    'skor_diperoleh',
    'exam_session_id',
    'question_id',
    'selected_option_id',
    'essay_answer',
    'is_correct',
    'score_earned',
])]
class StudentAnswer extends Model
{
    /** @use HasFactory<StudentAnswerFactory> */
    use HasFactory, HasUuids;

    protected $table = 'jawaban_siswa';

    protected $fillable = [
        'id_sesi_ujian',
        'id_soal',
        'id_opsi_dipilih',
        'jawaban_esai',
        'benar',
        'skor_diperoleh',
        'exam_session_id',
        'question_id',
        'selected_option_id',
        'essay_answer',
        'is_correct',
        'score_earned',
    ];

    protected $appends = [
        'exam_session_id',
        'question_id',
        'selected_option_id',
        'essay_answer',
        'is_correct',
        'score_earned',
    ];

    // Property compatibility accessors & mutators
    public function getExamSessionIdAttribute(): ?string
    {
        return $this->attributes['id_sesi_ujian'] ?? null;
    }

    public function setExamSessionIdAttribute($value): void
    {
        $this->attributes['id_sesi_ujian'] = $value;
    }

    public function getQuestionIdAttribute(): ?string
    {
        return $this->attributes['id_soal'] ?? null;
    }

    public function setQuestionIdAttribute($value): void
    {
        $this->attributes['id_soal'] = $value;
    }

    public function getSelectedOptionIdAttribute(): ?string
    {
        return $this->attributes['id_opsi_dipilih'] ?? null;
    }

    public function setSelectedOptionIdAttribute($value): void
    {
        $this->attributes['id_opsi_dipilih'] = $value;
    }

    public function getEssayAnswerAttribute(): ?string
    {
        return $this->attributes['jawaban_esai'] ?? null;
    }

    public function setEssayAnswerAttribute($value): void
    {
        $this->attributes['jawaban_esai'] = $value;
    }

    public function getIsCorrectAttribute(): ?bool
    {
        return isset($this->attributes['benar']) ? (bool) $this->attributes['benar'] : null;
    }

    public function setIsCorrectAttribute($value): void
    {
        $this->attributes['benar'] = is_null($value) ? null : (bool) $value;
    }

    public function getScoreEarnedAttribute(): ?float
    {
        return isset($this->attributes['skor_diperoleh']) ? (float) $this->attributes['skor_diperoleh'] : null;
    }

    public function setScoreEarnedAttribute($value): void
    {
        $this->attributes['skor_diperoleh'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'benar' => 'boolean',
            'skor_diperoleh' => 'float',
        ];
    }

    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'id_sesi_ujian');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'id_soal');
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(Option::class, 'id_opsi_dipilih');
    }
}
