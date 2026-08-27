<?php

namespace Tests\Feature\Admin;

use App\Models\Classroom;
use App\Models\Major;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassroomManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_classrooms_list()
    {
        $admin = User::factory()->create(['peran' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.classrooms.index'));

        $response->assertRedirect(route('admin.majors.index'));
    }

    public function test_admin_can_create_classroom_with_homeroom_teacher()
    {
        $admin = User::factory()->create(['peran' => 'admin']);
        $teacherUser = User::factory()->create(['peran' => 'guru', 'disetujui' => true]);
        $teacher = Teacher::create([
            'id_pengguna' => $teacherUser->id,
            'nip' => '198501012010011001',
        ]);

        $major = Major::create([
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.classrooms.store'), [
            'id_jurusan' => $major->id,
            'id_wali_kelas' => $teacher->id,
            'tingkat' => '12',
            'rombel' => 'A',
            'nama_kelas' => '12 TKJ A',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response->assertRedirect(route('admin.majors.index'));
        $this->assertDatabaseHas('kelas', [
            'id_jurusan' => $major->id,
            'id_wali_kelas' => $teacher->id,
            'nama_kelas' => '12 TKJ A',
        ]);
    }

    public function test_admin_cannot_create_duplicate_classroom()
    {
        $admin = User::factory()->create(['peran' => 'admin']);
        $major = Major::create([
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);

        Classroom::create([
            'id_jurusan' => $major->id,
            'tingkat' => '12',
            'rombel' => 'A',
            'nama_kelas' => '12 TKJ A',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.classrooms.store'), [
            'id_jurusan' => $major->id,
            'tingkat' => '12',
            'rombel' => 'A',
            'nama_kelas' => '12 TKJ A',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response->assertSessionHasErrors('rombel');
    }

    public function test_admin_can_update_classroom()
    {
        $admin = User::factory()->create(['peran' => 'admin']);
        $major = Major::create([
            'kode_jurusan' => 'TKL',
            'nama_jurusan' => 'Teknik Ketenagalistrikan',
        ]);

        $classroom = Classroom::create([
            'id_jurusan' => $major->id,
            'tingkat' => '10',
            'rombel' => 'B',
            'nama_kelas' => '10 TKL B',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.classrooms.update', $classroom->id), [
            'id_jurusan' => $major->id,
            'tingkat' => '11',
            'rombel' => 'B',
            'nama_kelas' => '11 TKL B',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response->assertRedirect(route('admin.majors.index'));
        $this->assertDatabaseHas('kelas', [
            'id' => $classroom->id,
            'tingkat' => '11',
            'nama_kelas' => '11 TKL B',
        ]);
    }

    public function test_admin_can_delete_classroom()
    {
        $admin = User::factory()->create(['peran' => 'admin']);
        $major = Major::create([
            'kode_jurusan' => 'RPL',
            'nama_jurusan' => 'Rekayasa Perangkat Lunak',
        ]);

        $classroom = Classroom::create([
            'id_jurusan' => $major->id,
            'tingkat' => '12',
            'rombel' => 'C',
            'nama_kelas' => '12 RPL C',
            'tahun_ajaran' => '2026/2027',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.classrooms.destroy', $classroom->id));

        $response->assertRedirect(route('admin.majors.index'));
        $this->assertDatabaseMissing('kelas', ['id' => $classroom->id]);
    }
}
