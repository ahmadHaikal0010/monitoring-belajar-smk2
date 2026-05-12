<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserApprovalTest extends TestCase
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
    }

    public function test_admin_can_view_approval_list()
    {
        // Create 3 unapproved users and 2 approved users
        User::factory()->count(3)->create(['is_approved' => false]);
        User::factory()->count(2)->create(['is_approved' => true]);

        $response = $this->actingAs($this->admin)->get(route('admin.users.approval'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/approval')
            ->has('users.data', 3) // Only unapproved users
            ->has('filters.status')
            ->where('filters.status', 'pending')
        );
    }

    public function test_admin_can_approve_user()
    {
        $user = User::factory()->create([
            'is_approved' => false,
        ]);

        $response = $this->actingAs($this->admin)->put(route('admin.users.approve', ['id' => $user->id]));

        $response->assertRedirect(route('admin.users.approval'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_approved' => true,
        ]);
    }

    public function test_teacher_cannot_approve_user()
    {
        $teacher = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $user = User::factory()->create(['is_approved' => false]);

        $response = $this->actingAs($teacher)->put(route('admin.users.approve', ['id' => $user->id]));

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_approved' => false,
        ]);
    }
}
