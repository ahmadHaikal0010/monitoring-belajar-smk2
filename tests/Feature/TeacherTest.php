<?php

namespace Tests\Feature;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_have_teacher_data_can_access_profile_page()
    {
        $user = User::factory()
            ->has(Teacher::factory())
            ->create([
                'role' => 'guru',
                'is_approved' => true,
            ]);

        $response = $this->actingAs($user)->get(route('teacher.profile'));

        $response->assertStatus(200);
    }

    public function test_user_unauthenticated_cannot_acces_profile_page()
    {
        $response = $this->actingAsGuest()->get(route('teacher.profile'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_see_correct_profile_data()
    {
        $user = User::factory()->create([
            'name' => 'budi',
            'email' => 'budi@example.com',
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $user->teacher()->save(Teacher::factory()->create([
            'nip' => '123456789012345678',
            'bio' => 'Guru Fisika dengan 10 tahun pengalaman',
            'specialization' => 'science',
        ]));

        $this->actingAs($user);

        $response = $this->get(route('teacher.profile'));

        $response->assertSee('budi');
        $response->assertSee('budi@example.com');
        $response->assertSee('123456789012345678');
        $response->assertSee('Guru Fisika dengan 10 tahun pengalaman');
        $response->assertSee('science');
    }

    public function test_user_can_update_profile()
    {
        $user = User::factory()->create([
            'name' => 'budi',
            'email' => 'budi@example.com',
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $user->teacher()->save(Teacher::factory()->create([
            'nip' => '123456789012345678',
            'bio' => 'Guru Fisika dengan 10 tahun pengalaman',
            'specialization' => 'science',
        ]));

        $this->actingAs($user);

        $response = $this->put(route('teacher.update', $user->teacher->id), [
            'bio' => 'Guru komputer yang berpengalaman',
            'specialization' => 'komputer',
        ]);

        $response->assertRedirect(route('teacher.profile'));
        $response->assertSessionHas('success');

        // Muat ulang data dari database
        $user->teacher->refresh();

        $this->assertEquals('komputer', $user->teacher->specialization);
        $this->assertEquals('Guru komputer yang berpengalaman', $user->teacher->bio);
    }

    public function test_nip_cannot_be_updated()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);

        $user->teacher()->save(Teacher::factory()->create([
            'nip' => '123456789012345678',
            'specialization' => 'science',
        ]));

        $this->actingAs($user);

        $this->put(route('teacher.update', $user->teacher->id), [
            'nip' => '999999999999999999', // mencoba mengganti NIP
            'specialization' => 'komputer',
        ]);

        $user->teacher->refresh();

        $this->assertEquals('123456789012345678', $user->teacher->nip); // tetap sama
        $this->assertEquals('komputer', $user->teacher->specialization); // yang lain bisa berubah
    }

    public function test_profile_photo_upload_works_and_rejects_invalid_formats()
    {
        $user = User::factory()->create(['role' => 'guru', 'is_approved' => true]);

        $this->actingAs($user);

        Storage::fake('public');

        // Test valid upload
        $file = UploadedFile::fake()->image('teacher.jpg');

        $response = $this->post(route('teacher.store'), [
            'nip' => '123456789012345678',
            'specialization' => 'Matematika',
            'photo' => $file,
        ]);

        $response->assertRedirect();

        $teacher = Teacher::where('user_id', $user->id)->first();
        $this->assertNotNull($teacher->photo);
        Storage::disk('public')->assertExists($teacher->photo);

        // Test invalid format
        $invalidFile = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->post(route('teacher.store'), [
            'nip' => '876543210987654321',
            'specialization' => 'Fisika',
            'photo' => $invalidFile,
        ]);

        $response->assertSessionHasErrors('photo');
    }
}
