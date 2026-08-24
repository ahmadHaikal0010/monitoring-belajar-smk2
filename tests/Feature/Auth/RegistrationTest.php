<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_web_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertStatus(200);
    }

    public function test_new_students_can_register_on_web()
    {
        $response = $this->post(route('register'), [
            'name' => 'Siswa Baru Web',
            'email' => 'siswaweb@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'nisn' => '0098765432',
            'alamat' => 'Jl. Pendidikan No. 5',
        ]);

        $this->assertDatabaseHas('pengguna', [
            'nama' => 'Siswa Baru Web',
            'email' => 'siswaweb@example.com',
            'peran' => 'siswa',
            'disetujui' => false,
        ]);

        $this->assertDatabaseHas('siswa', [
            'nisn' => '0098765432',
            'alamat' => 'Jl. Pendidikan No. 5',
        ]);
    }

    public function test_mobile_api_registration_can_be_performed()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Siswa Baru Mobile',
            'email' => 'siswabaru@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'nisn' => '1234567890',
            'address' => 'Jl. Lubuk Basung No. 10',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('pengguna', [
            'nama' => 'Siswa Baru Mobile',
            'email' => 'siswabaru@example.com',
            'peran' => 'siswa',
            'disetujui' => false,
        ]);
    }
}
