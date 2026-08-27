<?php

namespace Tests\Feature\Admin;

use App\Models\Major;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MajorManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_majors_list()
    {
        $admin = User::factory()->create(['peran' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.majors.index'));

        $response->assertOk();
    }

    public function test_admin_can_create_new_major()
    {
        $admin = User::factory()->create(['peran' => 'admin']);

        $response = $this->actingAs($admin)->post(route('admin.majors.store'), [
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);

        $response->assertRedirect(route('admin.majors.index'));
        $this->assertDatabaseHas('jurusan', [
            'kode_jurusan' => 'TKJ',
            'nama_jurusan' => 'Teknik Komputer dan Jaringan',
        ]);
    }

    public function test_admin_can_update_major()
    {
        $admin = User::factory()->create(['peran' => 'admin']);
        $major = Major::create([
            'kode_jurusan' => 'TKL',
            'nama_jurusan' => 'Teknik Ketenagalistrikan',
        ]);

        $response = $this->actingAs($admin)->put(route('admin.majors.update', $major->id), [
            'kode_jurusan' => 'TKL-REV',
            'nama_jurusan' => 'Teknik Ketenagalistrikan Revisi',
        ]);

        $response->assertRedirect(route('admin.majors.index'));
        $this->assertDatabaseHas('jurusan', [
            'id' => $major->id,
            'kode_jurusan' => 'TKL-REV',
        ]);
    }

    public function test_admin_can_delete_major()
    {
        $admin = User::factory()->create(['peran' => 'admin']);
        $major = Major::create([
            'kode_jurusan' => 'RPL',
            'nama_jurusan' => 'Rekayasa Perangkat Lunak',
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.majors.destroy', $major->id));

        $response->assertRedirect(route('admin.majors.index'));
        $this->assertDatabaseMissing('jurusan', ['id' => $major->id]);
    }
}
