<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\AssignmentSubmissionFile;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class AssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subject = Subject::first();
        $teacher = Teacher::first();
        $student = Student::first();

        if (! $subject || ! $teacher || ! $student) {
            return;
        }

        $assignment = Assignment::create([
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'title' => 'Tugas Praktikum Pemrograman Web',
            'description' => 'Silakan upload hasil screenshot aplikasi (bulk image) atau laporan lengkap dalam format PDF.',
            'due_date' => now()->addDays(7),
            'max_score' => 100,
            'allowed_file_types' => ['image', 'pdf'],
            'status' => 'published',
        ]);

        $submission = AssignmentSubmission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $student->id,
            'submitted_at' => now(),
            'notes' => 'Berikut hasil laporan praktikum saya Pak.',
            'status' => 'submitted',
        ]);

        AssignmentSubmissionFile::create([
            'assignment_submission_id' => $submission->id,
            'file_path' => 'assignments/submissions/tugas_praktikum.pdf',
            'file_name' => 'tugas_praktikum.pdf',
            'file_type' => 'pdf',
            'file_size' => 1024000,
            'mime_type' => 'application/pdf',
        ]);
    }
}
