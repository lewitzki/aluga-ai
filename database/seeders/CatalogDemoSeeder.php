<?php

namespace Database\Seeders;

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Seeder;

class CatalogDemoSeeder extends Seeder
{
    /**
     * Ferramentas de exemplo para catálogo público e testes E2E.
     */
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@teste.local')->first();
        $cliente = User::query()->where('email', 'cliente@teste.local')->first();

        if (! $admin || ! $cliente) {
            return;
        }

        $furadeira = Tool::query()->updateOrCreate(
            ['name' => 'Furadeira Catálogo E2E'],
            [
                'user_id' => $admin->id,
                'description' => 'Busca única furadeira_catalogo_token_xyz',
                'hourly_rate' => 25.5,
                'is_available' => true,
            ],
        );

        Tool::query()->updateOrCreate(
            ['name' => 'Betoneira Premium Catálogo'],
            [
                'user_id' => $admin->id,
                'description' => 'Equipamento pesado para grandes volumes.',
                'hourly_rate' => 150,
                'is_available' => true,
            ],
        );

        Tool::query()->updateOrCreate(
            ['name' => 'Ferramenta Indisponível Catálogo'],
            [
                'user_id' => $admin->id,
                'description' => 'Marcada como indisponível no cadastro.',
                'hourly_rate' => 40,
                'is_available' => false,
            ],
        );

        $ocupada = Tool::query()->updateOrCreate(
            ['name' => 'Ferramenta Alugada Período Catálogo'],
            [
                'user_id' => $admin->id,
                'description' => 'Possui empréstimo sobreposto ao período de teste.',
                'hourly_rate' => 55,
                'is_available' => true,
            ],
        );

        Rental::query()->updateOrCreate(
            [
                'tool_id' => $ocupada->id,
                'starts_at' => '2030-06-01 10:00:00',
            ],
            [
                'client_id' => $cliente->id,
                'expected_ends_at' => '2030-06-07 18:00:00',
                'ended_at' => null,
                'status' => RentalStatus::Scheduled,
                'hourly_rate_snapshot' => 55,
                'estimated_total' => 800,
                'final_total' => null,
            ],
        );

        Tool::factory()
            ->count(15)
            ->create([
                'user_id' => $admin->id,
            ]);
    }
}
