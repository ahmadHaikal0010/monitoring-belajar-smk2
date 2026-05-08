<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_user_index_page()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        User::factory()->count(5)->create();

        $response = $this->actingAs($admin)->get(route('admin.users.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/index')
            ->has('users.data', 6) // 5 + 1 admin
            ->has('filters')
        );
    }

    public function test_admin_can_search_users()
    {
        $admin = User::factory()->create([
            'name' => 'Sistem Administrator',
            'email' => 'admin@sistem.com',
            'role' => 'admin',
            'is_approved' => true,
        ]);

        User::factory()->create([
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
        ]);

        User::factory()->create([
            'name' => 'Jane Smith',
            'email' => 'janesmith@example.com',
        ]);

        $response = $this->actingAs($admin)->get(route('admin.users.index', ['search' => 'John']));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/index')
            ->has('users.data', 1)
            ->where('users.data.0.name', 'John Doe')
        );
    }

    public function test_admin_can_sort_users()
    {
        $admin = User::factory()->create([
            'name' => 'Middle User',
            'role' => 'admin',
            'is_approved' => true,
        ]);

        User::factory()->create(['name' => 'Zack User']);
        User::factory()->create(['name' => 'Alice User']);

        $response = $this->actingAs($admin)->get(route('admin.users.index', [
            'sort' => 'name',
            'direction' => 'asc',
        ]));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/index')
            ->where('users.data.0.name', 'Alice User')
        );

        $response = $this->actingAs($admin)->get(route('admin.users.index', [
            'sort' => 'name',
            'direction' => 'desc',
        ]));

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/index')
            ->where('users.data.0.name', 'Zack User')
        );
    }

    public function test_guru_cannot_access_user_management()
    {
        $teacher = User::factory()->create([
            'role' => 'guru',
            'is_approved' => true,
        ]);

        $response = $this->actingAs($teacher)->get(route('admin.users.index'));

        $response->assertStatus(403);
    }

    public function test_admin_cannot_delete_themselves()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        $response = $this->actingAs($admin)->delete(route('admin.users.destroy', ['user' => $admin->id]));

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_unapproved_user_is_redirected_to_pending()
    {
        $user = User::factory()->unapproved()->create([
            'role' => 'guru',
        ]);

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('pending'));
    }

    public function test_approved_user_can_access_dashboard()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
        );
    }

    public function test_email_must_be_unique_on_update_except_own()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
        ]);

        $otherUser = User::factory()->create([
            'email' => 'other@example.com',
        ]);

        $response = $this->actingAs($admin)
            ->from(route('admin.users.edit', ['user' => $admin->id]))
            ->put(route('admin.users.update', ['user' => $admin->id]), [
                'name' => $admin->name,
                'email' => 'other@example.com',
                'role' => $admin->role,
                'is_approved' => true,
            ]);

        $response->assertRedirect(route('admin.users.edit', ['user' => $admin->id]));
        $response->assertSessionHasErrors('email');
    }

    public function test_updating_user_without_password_keeps_old_password()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_approved' => true,
            'password' => Hash::make('original-password'),
        ]);

        $response = $this->actingAs($admin)
            ->put(route('admin.users.update', ['user' => $admin->id]), [
                'name' => 'Administrator Updated',
                'email' => $admin->email,
                'role' => $admin->role,
                'is_approved' => true,
            ]);

        $response->assertRedirect(route('admin.users.index'));
        $this->assertTrue(Hash::check('original-password', $admin->fresh()->password));
    }
}
