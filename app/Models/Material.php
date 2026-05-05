<?php

namespace App\Models;

use App\Policies\MaterialPolicy;
use Database\Factories\MaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['subject_id', 'title', 'content_type', 'content_body', 'description'])]
#[UsePolicy(MaterialPolicy::class)]
class Material extends Model
{
    /** @use HasFactory<MaterialFactory> */
    use HasFactory, HasUuids;

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
