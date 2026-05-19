<?php

namespace Tests\Feature\Admin;

use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        Storage::fake('public');
    }

    public function test_admin_can_view_student_list()
    {
        Student::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.students.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Students/index')
            ->has('students.data', 5)
        );
    }

    public function test_admin_can_create_student_profile()
    {
        $user = User::factory()->create(['role' => 'siswa', 'is_approved' => true]);
        $photo = UploadedFile::fake()->image('student.jpg');

        $response = $this->actingAs($this->admin)->post(route('admin.students.store'), [
            'user_id' => $user->id,
            'nisn' => '1234567890',
            'address' => 'Jl. Test No. 123',
            'photo' => $photo,
        ]);

        $response->assertRedirect(route('admin.students.index'));
        $this->assertDatabaseHas('students', [
            'user_id' => $user->id,
            'nisn' => '1234567890',
        ]);

        $student = Student::where('user_id', $user->id)->first();
        Storage::disk('public')->assertExists($student->photo);
    }

    public function test_admin_can_update_student_profile()
    {
        $student = Student::factory()->create(['nisn' => '1111111111']);
        $newPhoto = UploadedFile::fake()->image('new_student.jpg');

        $response = $this->actingAs($this->admin)->put(route('admin.students.update', $student->id), [
            'nisn' => '2222222222',
            'address' => 'Alamat Baru',
            'photo' => $newPhoto,
        ]);

        $response->assertRedirect(route('admin.students.index'));
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'nisn' => '2222222222',
            'address' => 'Alamat Baru',
        ]);

        Storage::disk('public')->assertExists(Student::find($student->id)->photo);
    }

    public function test_admin_can_delete_student_profile()
    {
        $student = Student::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.students.destroy', $student->id));

        $response->assertRedirect(route('admin.students.index'));
        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }
}
