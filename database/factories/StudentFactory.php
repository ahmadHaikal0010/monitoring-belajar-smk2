<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => fake()->uuid(),
            'id_pengguna' => User::factory(),
            'nisn' => fake()->unique()->numerify('##########'),
            'alamat' => fake()->address(),
            'foto' => null,
        ];
    }
}
