<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Database\Factories\EnrollmentFactory;
use Database\Factories\StudentProgressFactory;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // StudentProgressFactory::factory(50)->create();
        // Material::factory(100)->create();
        // EnrollmentFactory::factory(100)->create();
        // Student::factory(82)->create();
        // Subject::factory(5)->create();
        Teacher::factory(100)->create();

        // User::factory()->create([
        //     'name' => 'guru',
        //     'email' => 'guru@gmail.com',
        //     'password' => bcrypt('guru12345'),
        //     'role' => 'guru',
        //     'is_approved' => true,
        // ]);

        // User::factory()->create([
        //     'name' => 'admin',
        //     'email' => 'admin@gmail.com',
        //     'password' => bcrypt('admin12345'),
        //     'role' => 'admin',
        //     'is_approved' => true,
        // ]);
    }
}
