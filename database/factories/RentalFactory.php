<?php

namespace Database\Factories;

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rental>
 */
class RentalFactory extends Factory
{
    protected $model = Rental::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $starts = fake()->dateTimeBetween('+1 day', '+1 month');
        $expectedEnds = (clone $starts)->modify('+'.fake()->numberBetween(2, 168).' hours');

        return [
            'tool_id' => Tool::factory(),
            'client_id' => User::factory()->cliente(),
            'starts_at' => $starts,
            'expected_ends_at' => $expectedEnds,
            'ended_at' => null,
            'status' => RentalStatus::Scheduled,
            'hourly_rate_snapshot' => fake()->randomFloat(2, 5, 120),
            'estimated_total' => fake()->randomFloat(2, 50, 800),
            'final_total' => null,
        ];
    }
}
