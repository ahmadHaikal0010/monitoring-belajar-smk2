<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_can_export_subject_report_excel(): void
    {
        $teacherUser = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($teacherUser)
            ->get(route('admin.subjects.export', [
                'subject' => $subject->id,
                'include_materials' => 1,
                'include_exams' => 1,
                'include_assignments' => 1,
                'format' => 'excel',
            ]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8');
        $this->assertStringContainsString('LAPORAN REKAPITULASI PEMBELAJARAN SISWA', $response->getContent());
    }

    public function test_guru_cannot_export_other_teachers_subject(): void
    {
        $teacherUser1 = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacherUser2 = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher2 = Teacher::factory()->create(['user_id' => $teacherUser2->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher2->id]);

        $response = $this->actingAs($teacherUser1)
            ->get(route('admin.subjects.export', [
                'subject' => $subject->id,
            ]));

        $response->assertStatus(403);
    }

    public function test_admin_can_export_any_subject_report(): void
    {
        $adminUser = User::factory()->create(['role' => 'admin', 'is_approved' => true]);
        $teacherUser = User::factory()->create(['role' => 'guru', 'is_approved' => true]);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        $subject = Subject::factory()->create(['teacher_id' => $teacher->id]);

        $response = $this->actingAs($adminUser)
            ->get(route('admin.subjects.export', [
                'subject' => $subject->id,
                'format' => 'print',
            ]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
        $this->assertStringContainsString('LAPORAN REKAPITULASI PEMBELAJARAN SISWA', $response->getContent());
    }
}
