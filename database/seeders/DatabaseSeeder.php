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
        // Subject::factory(100)->create();
        // Teacher::factory(100)->create();
        // User::factory(100)->create();

        User::factory()->create([
            'nama' => 'admin',
            'email' => 'admin@example.com',
            'kata_sandi' => bcrypt('admin12345'),
            'peran' => 'admin',
            'disetujui' => true,
        ]);

    }
}
