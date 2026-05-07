<?php

namespace Tests\Feature\Admin;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TeacherTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_index_page()
    {
        $user = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        $this->actingAs($user);

        $response = $this->get(route('admin.teachers.index'));

        $response->assertStatus(200);
    }

    public function test_teacher_cannot_access_index_page()
    {
        $user = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $this->actingAs($user);

        $response = $this->get(route('admin.teachers.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_create_teacher_profile_with_existing_user()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        $user = User::factory()->create(['role' => 'guru']);

        $this->actingAs($admin);

        $response = $this->post(route('admin.teachers.store'), [
            'user_id' => $user->id,
            'nip' => '123456789012345678',
            'specialization' => 'Computer Science',
        ]);

        // $response->assertStatus(201);
        $response->assertRedirect();
        $this->assertDatabaseHas('teachers', [
            'user_id' => $user->id,
            'nip' => '123456789012345678',
            'specialization' => 'Computer Science',
        ]);
    }

    public function test_nip_must_be_18_digits()
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_approved' => true]);
        $user = User::factory()->create(['role' => 'guru']);

        $response = $this->actingAs($admin)->post(route('admin.teachers.store'), [
            'user_id' => $user->id,
            'nip' => '12345678901234567', // 17 digit
            'specialization' => 'Computer Science',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('nip');
    }

    public function test_nip_must_be_unique()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'guru']);

        Teacher::factory()->create([
            'nip' => '123456789012345678',
        ]);

        $response = $this->actingAs($admin)->post(route('admin.teachers.store'), [
            'user_id' => $user->id,
            'nip' => '123456789012345678', // Sudah ada
            'specialization' => 'Computer Science',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('nip');
    }

    public function test_user_cannot_be_linked_to_multiple_teacher_profiles()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'guru']);

        Teacher::factory()->create([
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($admin)->post(route('admin.teachers.store'), [
            'user_id' => $user->id,
            'nip' => '999999999999999999',
            'specialization' => 'Computer Science',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('user_id');
    }

    public function test_deleting_teacher_profile_does_not_delete_user_but_removes_photo()
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => 'admin', 'is_approved' => true]);
        $user = User::factory()->create(['role' => 'guru']);
        $photo = UploadedFile::fake()->image('photo.jpg');

        // Create teacher with photo
        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'photo' => $photo->store('teacher-photos', 'public'),
        ]);

        // Ensure photo exists in fake storage
        Storage::disk('public')->assertExists($teacher->photo);

        $this->actingAs($admin);

        $response = $this->delete(route('admin.teachers.destroy', $teacher));

        $response->assertRedirect(route('admin.teachers.index'));

        // Assert teacher is deleted
        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);

        // Assert user still exists
        $this->assertDatabaseHas('users', ['id' => $user->id]);

        // Assert photo is removed from storage
        Storage::disk('public')->assertMissing($teacher->photo);
    }
}
