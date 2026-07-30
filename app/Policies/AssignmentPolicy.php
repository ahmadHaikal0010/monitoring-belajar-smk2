<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['guru', 'siswa']);
    }

    public function view(User $user, Assignment $assignment): bool
    {
        return in_array($user->role, ['guru', 'siswa']);
    }

    public function create(User $user): bool
    {
        return $user->role === 'guru';
    }

    public function update(User $user, Assignment $assignment): bool
    {
        return $user->role === 'guru' && $user->teacher?->id === $assignment->teacher_id;
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        return $user->role === 'guru' && $user->teacher?->id === $assignment->teacher_id;
    }

    public function grade(User $user, Assignment $assignment): bool
    {
        return $user->role === 'guru' && $user->teacher?->id === $assignment->teacher_id;
    }
}
