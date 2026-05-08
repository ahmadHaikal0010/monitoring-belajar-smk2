<?php

namespace Tests\Feature;

use App\Models\Material;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SubjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_hanya_melihat_mapelnya_sendiri()
    {
        $firstTeacherUser = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $firstTeacher = Teacher::factory()->create([
            'user_id' => $firstTeacherUser->id,
        ]);

        $secondTeacherUser = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $secondTeacher = Teacher::factory()->create([
            'user_id' => $secondTeacherUser->id,
        ]);

        $firstSubject = Subject::factory()->create([
            'teacher_id' => $firstTeacher->id,
            'title' => 'Matematika Guru Pertama',
        ]);

        Subject::factory()->create([
            'teacher_id' => $secondTeacher->id,
            'title' => 'Fisika Guru Kedua',
        ]);

        $response = $this->actingAs($firstTeacherUser)->get(route('teacher.subjects.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Subjects/index')
            ->has('subjects.data', 1)
            ->where('subjects.data.0.title', $firstSubject->title)
        );
    }

    public function test_guru_dilarang_akses_edit_mapel_guru_lain()
    {
        $ownerUser = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $ownerTeacher = Teacher::factory()->create([
            'user_id' => $ownerUser->id,
        ]);

        $otherUser = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $otherTeacher = Teacher::factory()->create([
            'user_id' => $otherUser->id,
        ]);

        $otherSubject = Subject::factory()->create([
            'teacher_id' => $otherTeacher->id,
        ]);

        $response = $this->actingAs($ownerUser)->get(route('teacher.subjects.edit', ['subject' => $otherSubject->id]));

        $response->assertStatus(403);
    }

    public function test_menghapus_mapel_otomatis_menghapus_materi_terkait()
    {
        $teacherUser = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $teacher = Teacher::factory()->create([
            'user_id' => $teacherUser->id,
        ]);

        $subject = Subject::factory()->create([
            'teacher_id' => $teacher->id,
        ]);

        Material::factory()->count(3)->create([
            'subject_id' => $subject->id,
        ]);

        $response = $this->actingAs($teacherUser)->delete(route('teacher.subjects.destroy', ['subject' => $subject->id]));

        $response->assertRedirect(route('teacher.subjects.index'));
        $this->assertDatabaseMissing('materials', [
            'subject_id' => $subject->id,
        ]);
        $this->assertDatabaseMissing('subjects', [
            'id' => $subject->id,
        ]);
    }

    public function test_admin_dilarang_membuat_mata_pelajaran()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        $response = $this->actingAs($admin)->post(route('teacher.subjects.store'), [
            'title' => 'Bahasa Indonesia',
            'description' => 'Materi dasar bahasa Indonesia.',
        ]);

        $response->assertStatus(403);
    }
}
