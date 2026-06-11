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
     * @return list<string>
     */
    public static function catalogToolNames(): array
    {
        return [
            'Serra Circular DeWalt 184mm',
            'Escalímetro Arquitetônico Profissional',
            'Kit Artesanato com Base de Corte A2',
            'Inversora de Solda 160A',
            'Multímetro Digital Profissional',
            'Martelo de Borracha 450g',
            'Esmerilhadeira Angular 750W',
            'Serra Circular Makita 190mm',
            'Prancheta Arquitetônica A1',
            'Kit Scrapbook Profissional',
            'Máquina de Solda MIG 200A',
            'Alicate Amperímetro Digital',
            'Martelo Unha 300g',
            'Esmerilhadeira Angular 4 Pol',
            'Serra Circular Bosch 165mm',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->admin(),
            'name' => fake()->unique()->randomElement(self::catalogToolNames()),
            'description' => fake()->optional()->paragraph(),
            'hourly_rate' => fake()->randomFloat(2, 5, 120),
            'is_available' => true,
        ];
    }
}
