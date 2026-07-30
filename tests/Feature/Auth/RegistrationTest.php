<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_web_registration_screen_redirects_to_login()
    {
        $response = $this->get(route('register'));

        $response->assertRedirect(route('login'));
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

        $this->assertDatabaseHas('users', [
            'name' => 'Siswa Baru Mobile',
            'email' => 'siswabaru@example.com',
            'role' => 'siswa',
            'is_approved' => false,
        ]);
    }
}
