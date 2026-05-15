<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tool>
 */
class ToolFactory extends Factory
{
    protected $model = Tool::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->admin(),
            'name' => fake()->words(3, true),
            'description' => fake()->optional()->paragraph(),
            'hourly_rate' => fake()->randomFloat(2, 5, 120),
            'is_available' => true,
        ];
    }
}
