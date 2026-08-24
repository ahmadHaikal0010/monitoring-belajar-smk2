<?php

namespace Database\Factories;

use App\Models\Option;
use App\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Option>
 */
class OptionFactory extends Factory
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
            'id_soal' => Question::factory(),
            'teks_opsi' => fake()->word(),
            'benar' => false,
            'urutan' => fake()->numberBetween(1, 5),
        ];
    }
}
