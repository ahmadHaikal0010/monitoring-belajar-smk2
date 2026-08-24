<?php

namespace App\Models;

use Database\Factories\QuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id_ujian',
    'id_materi',
    'teks_soal',
    'tipe_soal',
    'jalur_gambar',
    'bobot_skor',
    'urutan',
    'exam_id',
    'material_id',
    'question_text',
    'question_type',
    'image_path',
    'score',
    'order',
])]
class Question extends Model
{
    /** @use HasFactory<QuestionFactory> */
    use HasFactory, HasUuids;

    protected $table = 'soal';

    protected $fillable = [
        'id_ujian',
        'id_materi',
        'teks_soal',
        'tipe_soal',
        'jalur_gambar',
        'bobot_skor',
        'urutan',
        'exam_id',
        'material_id',
        'question_text',
        'question_type',
        'image_path',
        'score',
        'order',
    ];

    protected $appends = [
        'exam_id',
        'material_id',
        'question_text',
        'question_type',
        'image_path',
        'score',
        'order',
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

    public function getMaterialIdAttribute(): ?string
    {
        return $this->attributes['id_materi'] ?? null;
    }

    public function setMaterialIdAttribute($value): void
    {
        $this->attributes['id_materi'] = $value;
    }

    public function getQuestionTextAttribute(): ?string
    {
        return $this->attributes['teks_soal'] ?? null;
    }

    public function setQuestionTextAttribute($value): void
    {
        $this->attributes['teks_soal'] = $value;
    }

    public function getQuestionTypeAttribute(): ?string
    {
        return $this->attributes['tipe_soal'] ?? null;
    }

    public function setQuestionTypeAttribute($value): void
    {
        $this->attributes['tipe_soal'] = $value;
    }

    public function getImagePathAttribute(): ?string
    {
        return $this->attributes['jalur_gambar'] ?? null;
    }

    public function setImagePathAttribute($value): void
    {
        $this->attributes['jalur_gambar'] = $value;
    }

    public function getScoreAttribute(): ?float
    {
        return isset($this->attributes['bobot_skor']) ? (float) $this->attributes['bobot_skor'] : null;
    }

    public function setScoreAttribute($value): void
    {
        $this->attributes['bobot_skor'] = $value;
    }

    public function getOrderAttribute(): ?int
    {
        return isset($this->attributes['urutan']) ? (int) $this->attributes['urutan'] : null;
    }

    public function setOrderAttribute($value): void
    {
        $this->attributes['urutan'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'bobot_skor' => 'float',
            'urutan' => 'integer',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'id_ujian');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'id_materi');
    }

    public function options(): HasMany
    {
        return $this->hasMany(Option::class, 'id_soal')->orderBy('urutan');
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class, 'id_soal');
    }
}
