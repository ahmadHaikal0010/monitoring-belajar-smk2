<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['guru', 'siswa']);
    }

    public function view(User $user, Exam $exam): bool
    {
        return in_array($user->role, ['guru', 'siswa']);
    }

    public function create(User $user): bool
    {
        return $user->role === 'guru';
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->role === 'guru' && $user->teacher?->id === $exam->teacher_id;
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->role === 'guru' && $user->teacher?->id === $exam->teacher_id;
    }
}
