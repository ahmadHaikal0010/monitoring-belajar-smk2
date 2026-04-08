<?php

namespace App\Models;

use Database\Factories\LearningProgressFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LearningProgress extends Model
{
    /** @use HasFactory<LearningProgressFactory> */
    use HasFactory, HasUuids;
}
