<?php

namespace App\Models;

use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'nisn', 'address', 'photo'])]
class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory, HasUuids;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['photo_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full URL for the student's photo.
     */
    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->photo ? asset('storage/'.$this->photo) : null
        );
    }
}
