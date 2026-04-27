<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Teacher>
 */
class TeacherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nip' => $this->faker->unique()->numerify('##################'), // 18 digits
            'specialization' => $this->faker->randomElement(['Rekayasa Perangkat Lunak', 'Teknik Komputer dan Jaringan', 'Multimedia', 'Sistem Informasi']),
            'bio' => $this->faker->sentence(),
            'photo' => null,
        ];
    }
}
