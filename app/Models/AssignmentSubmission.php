<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\AssignmentSubmissionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Fillable([
    'id_tugas',
    'id_siswa',
    'dikumpulkan_pada',
    'catatan',
    'skor',
    'umpan_balik',
    'status',
    'assignment_id',
    'student_id',
    'submitted_at',
    'notes',
    'feedback',
])]
class AssignmentSubmission extends Model
{
    /** @use HasFactory<AssignmentSubmissionFactory> */
    use HasFactory, HasUuids;

    protected $table = 'pengumpulan_tugas';

    protected $fillable = [
        'id_tugas',
        'id_siswa',
        'dikumpulkan_pada',
        'catatan',
        'skor',
        'umpan_balik',
        'status',
        'assignment_id',
        'student_id',
        'submitted_at',
        'notes',
        'score',
        'feedback',
    ];

    protected $appends = [
        'assignment_id',
        'student_id',
        'submitted_at',
        'notes',
        'score',
        'feedback',
    ];

    // Property compatibility accessors & mutators
    public function getAssignmentIdAttribute(): ?string
    {
        return $this->attributes['id_tugas'] ?? null;
    }

    public function setAssignmentIdAttribute($value): void
    {
        $this->attributes['id_tugas'] = $value;
    }

    public function getStudentIdAttribute(): ?string
    {
        return $this->attributes['id_siswa'] ?? null;
    }

    public function setStudentIdAttribute($value): void
    {
        $this->attributes['id_siswa'] = $value;
    }

    public function getSubmittedAtAttribute()
    {
        $val = $this->dikumpulkan_pada ?? ($this->attributes['dikumpulkan_pada'] ?? null);
        if (is_null($val)) {
            return null;
        }

        return $val instanceof CarbonInterface ? $val : Carbon::parse($val);
    }

    public function setSubmittedAtAttribute($value): void
    {
        $this->attributes['dikumpulkan_pada'] = $value;
    }

    public function getNotesAttribute(): ?string
    {
        return $this->attributes['catatan'] ?? null;
    }

    public function setNotesAttribute($value): void
    {
        $this->attributes['catatan'] = $value;
    }

    public function getScoreAttribute(): ?float
    {
        return isset($this->attributes['skor']) ? (float) $this->attributes['skor'] : null;
    }

    public function setScoreAttribute($value): void
    {
        $this->attributes['skor'] = $value;
    }

    public function getFeedbackAttribute(): ?string
    {
        return $this->attributes['umpan_balik'] ?? null;
    }

    public function setFeedbackAttribute($value): void
    {
        $this->attributes['umpan_balik'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dikumpulkan_pada' => 'datetime',
            'skor' => 'float',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'id_tugas');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'id_siswa');
    }

    public function files(): HasMany
    {
        return $this->hasMany(AssignmentSubmissionFile::class, 'id_pengumpulan_tugas');
    }
}
