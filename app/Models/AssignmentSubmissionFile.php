<?php

namespace App\Models;

use Database\Factories\AssignmentSubmissionFileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'id_pengumpulan_tugas',
    'jalur_berkas',
    'nama_berkas',
    'tipe_berkas',
    'ukuran_berkas',
    'tipe_mime',
    'assignment_submission_id',
    'file_path',
    'file_name',
    'file_type',
    'file_size',
    'mime_type',
])]
class AssignmentSubmissionFile extends Model
{
    /** @use HasFactory<AssignmentSubmissionFileFactory> */
    use HasFactory, HasUuids;

    protected $table = 'berkas_pengumpulan_tugas';

    protected $fillable = [
        'id_pengumpulan_tugas',
        'jalur_berkas',
        'nama_berkas',
        'tipe_berkas',
        'ukuran_berkas',
        'tipe_mime',
        'assignment_submission_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'mime_type',
    ];

    protected $appends = [
        'assignment_submission_id',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'mime_type',
    ];

    // Property compatibility accessors & mutators
    public function getAssignmentSubmissionIdAttribute(): ?string
    {
        return $this->attributes['id_pengumpulan_tugas'] ?? null;
    }

    public function setAssignmentSubmissionIdAttribute($value): void
    {
        $this->attributes['id_pengumpulan_tugas'] = $value;
    }

    public function getFilePathAttribute(): ?string
    {
        return $this->attributes['jalur_berkas'] ?? null;
    }

    public function setFilePathAttribute($value): void
    {
        $this->attributes['jalur_berkas'] = $value;
    }

    public function getFileNameAttribute(): ?string
    {
        return $this->attributes['nama_berkas'] ?? null;
    }

    public function setFileNameAttribute($value): void
    {
        $this->attributes['nama_berkas'] = $value;
    }

    public function getFileTypeAttribute(): ?string
    {
        return $this->attributes['tipe_berkas'] ?? null;
    }

    public function setFileTypeAttribute($value): void
    {
        $this->attributes['tipe_berkas'] = $value;
    }

    public function getFileSizeAttribute(): ?int
    {
        return isset($this->attributes['ukuran_berkas']) ? (int) $this->attributes['ukuran_berkas'] : null;
    }

    public function setFileSizeAttribute($value): void
    {
        $this->attributes['ukuran_berkas'] = $value;
    }

    public function getMimeTypeAttribute(): ?string
    {
        return $this->attributes['tipe_mime'] ?? null;
    }

    public function setMimeTypeAttribute($value): void
    {
        $this->attributes['tipe_mime'] = $value;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ukuran_berkas' => 'integer',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(AssignmentSubmission::class, 'id_pengumpulan_tugas');
    }
}
