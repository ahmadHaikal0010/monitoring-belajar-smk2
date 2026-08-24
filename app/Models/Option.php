<?php

namespace App\Models;

use Database\Factories\OptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'id_soal',
    'teks_opsi',
    'benar',
    'urutan',
    'question_id',
    'option_text',
    'is_correct',
    'order',
])]
class Option extends Model
{
    /** @use HasFactory<OptionFactory> */
    use HasFactory, HasUuids;

    protected $table = 'opsi_jawaban';

    protected $fillable = [
        'id_soal',
        'teks_opsi',
        'benar',
        'urutan',
        'question_id',
        'option_text',
        'is_correct',
        'order',
    ];

    protected $appends = [
        'question_id',
        'option_text',
        'is_correct',
        'order',
    ];

    // Property compatibility accessors & mutators
    public function getQuestionIdAttribute(): ?string
    {
        return $this->attributes['id_soal'] ?? null;
    }

    public function setQuestionIdAttribute($value): void
    {
        $this->attributes['id_soal'] = $value;
    }

    public function getOptionTextAttribute(): ?string
    {
        return $this->attributes['teks_opsi'] ?? null;
    }

    public function setOptionTextAttribute($value): void
    {
        $this->attributes['teks_opsi'] = $value;
    }

    public function getIsCorrectAttribute(): bool
    {
        return (bool) ($this->attributes['benar'] ?? false);
    }

    public function setIsCorrectAttribute($value): void
    {
        $this->attributes['benar'] = (bool) $value;
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
            'benar' => 'boolean',
            'urutan' => 'integer',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'id_soal');
    }

    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentAnswer::class, 'id_opsi_dipilih');
    }
}
