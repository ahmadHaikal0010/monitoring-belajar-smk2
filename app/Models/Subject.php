<?php

namespace App\Models;

use App\Policies\SubjectPolicy;
use Database\Factories\SubjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'description'])]
#[UsePolicy(SubjectPolicy::class)]
class Subject extends Model
{
    /** @use HasFactory<SubjectFactory> */
    use HasFactory, HasUuids;

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
