<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\ToolImage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class CatalogDemoSeeder extends Seeder
{
    private const SEEDED_TOOL_NAMES = [
        'Furadeira Catálogo E2E',
        'Betoneira Premium Catálogo',
        'Ferramenta Indisponível Catálogo',
        'Ferramenta Alugada Período Catálogo',
    ];

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

        $betoneira = Tool::query()->updateOrCreate(
            ['name' => 'Betoneira Premium Catálogo'],
            [
                'user_id' => $admin->id,
                'description' => 'Equipamento pesado para grandes volumes.',
                'hourly_rate' => 150,
                'is_available' => true,
            ],
        );

        $indisponivel = Tool::query()->updateOrCreate(
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

        $now = Carbon::now();

        $activeRental = Rental::query()->updateOrCreate(
            [
                'tool_id' => $furadeira->id,
                'client_id' => $cliente->id,
                'status' => RentalStatus::Active,
            ],
            [
                'starts_at' => $now->copy()->subHours(3),
                'expected_ends_at' => $now->copy()->addHours(21),
                'ended_at' => null,
                'hourly_rate_snapshot' => 25.5,
                'estimated_total' => 612,
                'final_total' => null,
            ],
        );

        $finishedRental = Rental::query()->updateOrCreate(
            [
                'tool_id' => $betoneira->id,
                'client_id' => $cliente->id,
                'status' => RentalStatus::Finished,
            ],
            [
                'starts_at' => $now->copy()->subDays(10),
                'expected_ends_at' => $now->copy()->subDays(8),
                'ended_at' => $now->copy()->subDays(8),
                'hourly_rate_snapshot' => 150,
                'estimated_total' => 7200,
                'final_total' => 7150,
            ],
        );

        Payment::query()->updateOrCreate(
            ['rental_id' => $finishedRental->id],
            [
                'amount' => 7150,
                'currency' => 'BRL',
                'status' => PaymentStatus::Approved,
                'settled_at' => $now->copy()->subDays(8),
            ],
        );

        Payment::query()->updateOrCreate(
            ['rental_id' => $activeRental->id],
            [
                'amount' => 612,
                'currency' => 'BRL',
                'status' => PaymentStatus::Pending,
                'settled_at' => null,
            ],
        );

        Tool::factory()
            ->count(15)
            ->create([
                'user_id' => $admin->id,
            ]);

        $this->seedCatalogDemoImages($furadeira, $betoneira, $indisponivel, $ocupada, $admin->id);
    }

    /**
     * Copia JPGs locais para storage público e cria registros em tool_images.
     */
    private function seedCatalogDemoImages(
        Tool $furadeira,
        Tool $betoneira,
        Tool $indisponivel,
        Tool $ocupada,
        int $adminUserId,
    ): void {
        $this->syncToolImagesFromAssets($furadeira, [
            'furadeira.jpg',
            'marcenaria.jpg',
        ]);

        $this->syncToolImagesFromAssets($betoneira, [
            'betoneira.jpg',
            'canteiro.jpg',
        ]);

        $this->syncToolImagesFromAssets($indisponivel, [
            'caixa-ferramentas.jpg',
        ]);

        $this->syncToolImagesFromAssets($ocupada, [
            'ferramentas-parede.jpg',
            'bancada-trabalho.jpg',
        ]);

        $rotationPool = [
            'bancada-trabalho.jpg',
            'marcenaria.jpg',
            'canteiro.jpg',
            'ferramentas-parede.jpg',
            'caixa-ferramentas.jpg',
            'furadeira.jpg',
            'betoneira.jpg',
        ];

        $extras = Tool::query()
            ->where('user_id', $adminUserId)
            ->whereNotIn('name', self::SEEDED_TOOL_NAMES)
            ->orderBy('id')
            ->get();

        foreach ($extras as $index => $tool) {
            $file = $rotationPool[$index % count($rotationPool)];
            $this->syncToolImagesFromAssets($tool, [$file]);
        }
    }

    /**
     * @param  list<string>  $assetFilenames
     */
    private function syncToolImagesFromAssets(Tool $tool, array $assetFilenames): void
    {
        $filenames = array_values($assetFilenames);
        $assetsDir = database_path('seeders/assets/catalog-demo');
        $tool->images()->delete();
        $disk = Storage::disk('public');

        foreach ($filenames as $order => $filename) {
            $src = $assetsDir.DIRECTORY_SEPARATOR.$filename;

            if (! is_readable($src)) {
                continue;
            }

            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION) ?: 'jpg');
            $relative = 'tools/catalog-demo/'.$tool->id.'_'.$order.'.'.$ext;
            $disk->put($relative, file_get_contents($src));

            ToolImage::query()->create([
                'tool_id' => $tool->id,
                'path' => $relative,
                'sort_order' => $order * 10,
            ]);
        }
    }
}
