<?php

namespace App\Repositories;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SqlEnrollmentRepository implements EnrollmentRepositoryInterface
{
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $driver = DB::getDriverName();
        $likeOperator = $driver === 'pgsql' ? 'ilike' : 'like';

        $query = DB::table('enrollments')
            ->join('students', 'enrollments.student_id', '=', 'students.id')
            ->join('users as student_users', 'students.user_id', '=', 'student_users.id')
            ->join('subjects', 'enrollments.subject_id', '=', 'subjects.id')
            ->join('teachers', 'subjects.teacher_id', '=', 'teachers.id')
            ->join('users as teacher_users', 'teachers.user_id', '=', 'teacher_users.id')
            ->select([
                'enrollments.id',
                'enrollments.status',
                'enrollments.enrolled_at',
                'student_users.name as student_name',
                'student_users.email as student_email',
                'students.nisn as student_nisn',
                'subjects.title as subject_title',
                'subjects.code as subject_code',
                'teacher_users.name as teacher_name',
            ]);

        if (! empty($filters['teacher_id'])) {
            $query->where('subjects.teacher_id', $filters['teacher_id']);
        }

        if (! empty($filters['subject_id'])) {
            $query->where('enrollments.subject_id', $filters['subject_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('enrollments.status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters, $likeOperator) {
                $q->where('student_users.name', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('students.nisn', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('subjects.title', $likeOperator, '%'.$filters['search'].'%')
                    ->orWhere('subjects.code', $likeOperator, '%'.$filters['search'].'%');
            });
        }

        $sortField = $filters['sort'] ?? 'enrollments.enrolled_at';
        $sortDirection = $filters['direction'] ?? 'desc';

        $allowedSorts = ['student_users.name', 'subjects.title', 'enrollments.enrolled_at', 'enrollments.status'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('enrollments.enrolled_at', 'desc');
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function find(string $id)
    {
        return DB::table('enrollments')
            ->join('subjects', 'enrollments.subject_id', '=', 'subjects.id')
            ->where('enrollments.id', $id)
            ->select(['enrollments.*', 'subjects.teacher_id'])
            ->first();
    }

    public function enroll(string $studentId, string $subjectId)
    {
        DB::table('enrollments')->insert([
            'id' => (string) Str::uuid(),
            'student_id' => $studentId,
            'subject_id' => $subjectId,
            'status' => 'enrolled',
            'enrolled_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function isEnrolled(string $studentId, string $subjectId): bool
    {
        return DB::table('enrollments')
            ->where('student_id', $studentId)
            ->where('subject_id', $subjectId)
            ->exists();
    }

    public function getStudentEnrollments(string $studentId)
    {
        return DB::table('enrollments')
            ->join('subjects', 'enrollments.subject_id', '=', 'subjects.id')
            ->join('teachers', 'subjects.teacher_id', '=', 'teachers.id')
            ->join('users', 'teachers.user_id', '=', 'users.id')
            ->where('enrollments.student_id', $studentId)
            ->select([
                'subjects.id',
                'subjects.title',
                'subjects.code',
                'subjects.description',
                'users.name as teacher_name',
                'enrollments.status',
                'enrollments.enrolled_at',
            ])
            ->orderBy('subjects.title', 'asc')
            ->get();
    }

    public function delete(string $id)
    {
        DB::table('enrollments')->where('id', $id)->delete();
    }
}
