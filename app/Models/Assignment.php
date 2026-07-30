<?php

namespace App\Models;

use App\Policies\AssignmentPolicy;
use Database\Factories\AssignmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'subject_id',
    'teacher_id',
    'title',
    'description',
    'due_date',
    'max_score',
    'allowed_file_types',
    'status',
])]
#[UsePolicy(AssignmentPolicy::class)]
class Assignment extends Model
{
    /** @use HasFactory<AssignmentFactory> */
    use HasFactory, HasUuids;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'max_score' => 'integer',
            'allowed_file_types' => 'array',
        ];
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AssignmentSubmission::class);
    }
}
