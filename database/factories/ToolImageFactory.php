<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\ToolImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ToolImage>
 */
class ToolImageFactory extends Factory
{
    protected $model = ToolImage::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tool_id' => Tool::factory(),
            'path' => 'tools/'.fake()->uuid().'.jpg',
            'sort_order' => fake()->numberBetween(0, 50),
        ];
    }
}
