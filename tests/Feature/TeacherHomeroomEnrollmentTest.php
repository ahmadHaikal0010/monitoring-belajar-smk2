<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Major;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherHomeroomEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_assign_students_to_their_homeroom_classroom()
    {
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create([
            'id_pengguna' => $teacherUser->id,
            'nip' => '198501012010011001',
        ]);

        $major = Major::create([
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);

        $classroom = Classroom::create([
            'id_jurusan' => $major->id,
            'id_wali_kelas' => $teacher->id,
            'tingkat' => '12',
            'rombel' => 'A',
            'nama_kelas' => '12 TKJ A',
            'tahun_ajaran' => '2026/2027',
        ]);

        $studentUser = User::factory()->create(['peran' => 'siswa', 'disetujui' => true]);
        $student = Student::create([
            'id_pengguna' => $studentUser->id,
            'nisn' => '0012345678',
            'alamat' => 'Jl. Merdeka No. 1',
        ]);

        $response = $this->actingAs($teacherUser)->post(route('teacher.homeroom.students.store'), [
            'student_ids' => [$student->id],
        ]);

        $response->assertRedirect(route('teacher.homeroom.index'));
        $this->assertDatabaseHas('anggota_kelas', [
            'id_kelas' => $classroom->id,
            'id_siswa' => $student->id,
            'status' => 'aktif',
        ]);
        $this->assertDatabaseHas('siswa', [
            'id' => $student->id,
            'id_kelas' => $classroom->id,
        ]);
    }
}
