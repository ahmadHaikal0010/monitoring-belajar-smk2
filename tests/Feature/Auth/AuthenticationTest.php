<?php

namespace Tests\Feature\Auth;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Fortify\Features;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered()
    {
        $response = $this->get(route('login'));

        $response->assertOk();
    }

    public function test_users_can_authenticate_using_the_login_screen()
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'nomor_induk' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_with_remember_me()
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'nomor_induk' => $user->email,
            'password' => 'password',
            'remember' => 'on',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
        $response->assertCookie(auth()->guard()->getRecallerName());
    }

    public function test_students_can_authenticate_using_nisn_on_web()
    {
        $user = User::factory()->create([
            'peran' => 'siswa',
            'disetujui' => true,
        ]);

        Student::create([
            'id_pengguna' => $user->id,
            'nisn' => '0012345678',
            'alamat' => 'Jl. Merdeka No. 1',
        ]);

        $response = $this->post(route('login.store'), [
            'nomor_induk' => '0012345678',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_teachers_can_authenticate_using_nip_on_web()
    {
        $user = User::factory()->create([
            'peran' => 'guru',
            'disetujui' => true,
        ]);

        Teacher::create([
            'id_pengguna' => $user->id,
            'nip' => '199001012020011001',
        ]);

        $response = $this->post(route('login.store'), [
            'nomor_induk' => '199001012020011001',
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_students_can_authenticate_using_nisn_on_mobile_api()
    {
        $user = User::factory()->create([
            'peran' => 'siswa',
            'disetujui' => true,
        ]);

        Student::create([
            'id_pengguna' => $user->id,
            'nisn' => '0099887766',
            'alamat' => 'Jl. Anggrek No. 2',
        ]);

        $response = $this->postJson('/api/login', [
            'nisn' => '0099887766',
            'password' => 'password',
            'device_name' => 'Android Phone',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }

    public function test_users_with_two_factor_enabled_are_redirected_to_two_factor_challenge()
    {
        $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->create();

        $user->forceFill([
            'two_factor_secret' => encrypt('test-secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['code1', 'code2'])),
            'two_factor_confirmed_at' => now(),
        ])->save();

        $response = $this->post(route('login'), [
            'nomor_induk' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $response->assertSessionHas('login.id', $user->id);
        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_with_invalid_password()
    {
        $user = User::factory()->create();

        $this->post(route('login.store'), [
            'nomor_induk' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect(route('home'));
    }

    public function test_users_are_rate_limited()
    {
        $user = User::factory()->create();

        RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

        $response = $this->post(route('login.store'), [
            'nomor_induk' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertTooManyRequests();
    }
}
