<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
