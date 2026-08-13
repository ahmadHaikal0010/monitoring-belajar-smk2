<?php

namespace App\Models;

use App\Policies\TeacherPolicy;
use Database\Factories\TeacherFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'nip', 'photo', 'bio', 'specialization'])]
#[UsePolicy(TeacherPolicy::class)]
class Teacher extends Model
{
    /** @use HasFactory<TeacherFactory> */
    use HasFactory, HasUuids;

    protected $appends = ['photo_url'];

    protected function photoUrl(): Attribute
    {
        return Attribute::get(function () {
            if (! $this->photo) {
                return null;
            }

            if (str_starts_with($this->photo, 'http://') || str_starts_with($this->photo, 'https://')) {
                return $this->photo;
            }

            return url('storage/'.ltrim($this->photo, '/'));
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function exams()
    {
        return $this->hasMany(Exam::class);
    }
}
