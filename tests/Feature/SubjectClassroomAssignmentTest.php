<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Major;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubjectClassroomAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_sync_classrooms_for_subject()
    {
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create([
            'id_pengguna' => $teacherUser->id,
            'nip' => '198501012010011001',
        ]);

        $subject = Subject::create([
            'id_guru' => $teacher->id,
            'judul' => 'Pemrograman Web lanjut',
            'kode' => 'PWL001',
        ]);

        $major = Major::create([
            'kode_jurusan' => 'RPL',
            'nama_jurusan' => 'Rekayasa Perangkat Lunak',
        ]);

        $classroom1 = Classroom::create([
            'id_jurusan' => $major->id,
            'tingkat' => '12',
            'rombel' => 'A',
            'nama_kelas' => '12 RPL A',
            'tahun_ajaran' => '2026/2027',
        ]);

        $classroom2 = Classroom::create([
            'id_jurusan' => $major->id,
            'tingkat' => '12',
            'rombel' => 'B',
            'nama_kelas' => '12 RPL B',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response = $this->actingAs($teacherUser)->post(route('teacher.subjects.classrooms.sync', $subject->id), [
            'classroom_ids' => [$classroom1->id, $classroom2->id],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('kelas_mata_pelajaran', [
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classroom1->id,
        ]);
        $this->assertDatabaseHas('kelas_mata_pelajaran', [
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classroom2->id,
        ]);
    }

    public function test_subject_show_page_loads_with_classrooms_and_tabs()
    {
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create([
            'id_pengguna' => $teacherUser->id,
            'nip' => '198501012010011002',
        ]);

        $subject = Subject::create([
            'id_guru' => $teacher->id,
            'judul' => 'Basis Data',
            'kode' => 'BD001',
        ]);

        $response = $this->actingAs($teacherUser)->get(route('teacher.subjects.show', $subject->id));

        $response->assertOk();
    }
}
