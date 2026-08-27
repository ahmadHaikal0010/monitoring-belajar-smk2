<?php

namespace Tests\Feature\Admin;

use App\Models\Classroom;
use App\Models\Major;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassEnrollmentManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_assign_students_to_classroom()
    {
        $admin = User::factory()->create(['peran' => 'admin']);

        $major = Major::create([
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);

        $classroom = Classroom::create([
            'id_jurusan' => $major->id,
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

        $response = $this->actingAs($admin)->post(route('admin.classrooms.students.store', $classroom->id), [
            'student_ids' => [$student->id],
        ]);

        $response->assertRedirect(route('admin.classrooms.students.index', $classroom->id));
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

    public function test_admin_can_remove_student_from_classroom()
    {
        $admin = User::factory()->create(['peran' => 'admin']);

        $major = Major::create([
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);

        $classroom = Classroom::create([
            'id_jurusan' => $major->id,
            'tingkat' => '12',
            'rombel' => 'A',
            'nama_kelas' => '12 TKJ A',
            'tahun_ajaran' => '2026/2027',
        ]);

        $studentUser = User::factory()->create(['peran' => 'siswa', 'disetujui' => true]);
        $student = Student::create([
            'id_pengguna' => $studentUser->id,
            'nisn' => '0087654321',
            'alamat' => 'Jl. Sudirman No. 2',
        ]);

        $this->actingAs($admin)->post(route('admin.classrooms.students.store', $classroom->id), [
            'student_ids' => [$student->id],
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.classrooms.students.destroy', [
            'classroom' => $classroom->id,
            'student' => $student->id,
        ]));

        $response->assertRedirect(route('admin.classrooms.students.index', $classroom->id));
        $this->assertDatabaseMissing('anggota_kelas', [
            'id_kelas' => $classroom->id,
            'id_siswa' => $student->id,
        ]);
        $this->assertDatabaseHas('siswa', [
            'id' => $student->id,
            'id_kelas' => null,
        ]);
    }
}
