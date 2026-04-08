<?php

namespace Database\Seeders;

use App\Models\LearningProgress;
use App\Models\Material;
use App\Models\Student;
use App\Models\StudentActivity;
use App\Models\Subject;
use App\Models\Teacher;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        LearningProgress::factory(50)->create();
        Material::factory(100)->create();
        StudentActivity::factory(100)->create();
        Student::factory(82)->create();
        Subject::factory(5)->create();
        Teacher::factory(10)->create();
    }
}
