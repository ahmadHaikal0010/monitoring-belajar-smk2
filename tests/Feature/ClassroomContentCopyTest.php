<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Exam;
use App\Models\Major;
use App\Models\Material;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassroomContentCopyTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_copy_materials_from_another_classroom()
    {
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create(['id_pengguna' => $teacherUser->id, 'nip' => '198501012010011003']);
        $subject = Subject::create(['id_guru' => $teacher->id, 'judul' => 'Pemrograman Web', 'kode' => 'PW001']);
        $major = Major::create(['kode_jurusan' => 'RPL', 'nama_jurusan' => 'Rekayasa Perangkat Lunak']);

        $classA = Classroom::create(['id_jurusan' => $major->id, 'tingkat' => '12', 'rombel' => 'A', 'nama_kelas' => '12 RPL A', 'tahun_ajaran' => '2026/2027']);
        $classB = Classroom::create(['id_jurusan' => $major->id, 'tingkat' => '12', 'rombel' => 'B', 'nama_kelas' => '12 RPL B', 'tahun_ajaran' => '2026/2027']);

        $materialA = Material::create([
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classA->id,
            'judul' => 'HTML & CSS Dasar',
            'tipe_konten' => 'document',
        ]);

        $response = $this->actingAs($teacherUser)->post(
            route('teacher.subjects.classrooms.materials.copy', [$subject->id, $classB->id]),
            ['material_ids' => [$materialA->id]]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('materi', [
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classB->id,
            'judul' => 'HTML & CSS Dasar (Salinan)',
        ]);
    }

    public function test_teacher_can_copy_exams_from_another_classroom()
    {
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create(['id_pengguna' => $teacherUser->id, 'nip' => '198501012010011004']);
        $subject = Subject::create(['id_guru' => $teacher->id, 'judul' => 'Matematika', 'kode' => 'MTK01']);
        $major = Major::create(['kode_jurusan' => 'TKJ', 'nama_jurusan' => 'Teknik Komputer Jaringan']);

        $classA = Classroom::create(['id_jurusan' => $major->id, 'tingkat' => '10', 'rombel' => 'A', 'nama_kelas' => '10 TKJ A', 'tahun_ajaran' => '2026/2027']);
        $classB = Classroom::create(['id_jurusan' => $major->id, 'tingkat' => '10', 'rombel' => 'B', 'nama_kelas' => '10 TKJ B', 'tahun_ajaran' => '2026/2027']);

        $examA = Exam::create([
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classA->id,
            'id_guru' => $teacher->id,
            'judul' => 'Ujian Tengah Semester',
            'durasi' => 90,
            'nilai_kkm' => 75,
        ]);

        $response = $this->actingAs($teacherUser)->post(
            route('teacher.subjects.classrooms.exams.copy', [$subject->id, $classB->id]),
            ['exam_ids' => [$examA->id]]
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('ujian', [
            'id_mata_pelajaran' => $subject->id,
            'id_kelas' => $classB->id,
            'judul' => 'Ujian Tengah Semester (Salinan)',
        ]);
    }

    public function test_teacher_can_view_classroom_student_progress()
    {
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create(['id_pengguna' => $teacherUser->id, 'nip' => '198501012010011005']);
        $subject = Subject::create(['id_guru' => $teacher->id, 'judul' => 'Basis Data', 'kode' => 'BD001']);
        $major = Major::create(['kode_jurusan' => 'RPL2', 'nama_jurusan' => 'Rekayasa Perangkat Lunak 2']);
        $classA = Classroom::create(['id_jurusan' => $major->id, 'tingkat' => '11', 'rombel' => 'A', 'nama_kelas' => '11 RPL A', 'tahun_ajaran' => '2026/2027']);

        $response = $this->actingAs($teacherUser)->get(
            route('teacher.subjects.classrooms.progress', [$subject->id, $classA->id])
        );

        $response->assertOk();
    }
}
