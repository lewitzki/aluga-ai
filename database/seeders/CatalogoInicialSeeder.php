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

class CatalogoInicialSeeder extends Seeder
{
    private const NOMES_FERRAMENTAS_PRINCIPAIS = [
        'Máquina de Solda Arco 250A',
        'Kit Instalação Elétrica Residencial',
        'Martelo Unha 500g',
        'Esmerilhadeira Angular 4½ Pol',
    ];

    /**
     * Ferramentas iniciais do catálogo público e cenários de teste E2E.
     */
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@teste.local')->first();
        $cliente = User::query()->where('email', 'cliente@teste.local')->first();

        if (! $admin || ! $cliente) {
            return;
        }

        $maquinaSoldaArco = Tool::query()->updateOrCreate(
            ['name' => 'Máquina de Solda Arco 250A'],
            [
                'owner_id' => $admin->id,
                'description' => 'Inversora de solda eletrodo revestido 250A monofásica. Busca única maquina_solda_arco_250a_inversora.',
                'hourly_rate' => 25.5,
                'is_available' => true,
            ],
        );

        $kitInstalacaoEletrica = Tool::query()->updateOrCreate(
            ['name' => 'Kit Instalação Elétrica Residencial'],
            [
                'owner_id' => $admin->id,
                'description' => 'Multímetro, alicate amperímetro e ferramentas para instalações elétricas residenciais.',
                'hourly_rate' => 150,
                'is_available' => true,
            ],
        );

        $marteloUnha = Tool::query()->updateOrCreate(
            ['name' => 'Martelo Unha 500g'],
            [
                'owner_id' => $admin->id,
                'description' => 'Martelo unha com cabo emborrachado, 500g. Temporariamente indisponível para locação.',
                'hourly_rate' => 40,
                'is_available' => false,
            ],
        );

        $esmerilhadeiraAngular = Tool::query()->updateOrCreate(
            ['name' => 'Esmerilhadeira Angular 4½ Pol'],
            [
                'owner_id' => $admin->id,
                'description' => 'Esmerilhadeira angular 850W com disco de 4½ polegadas para corte e desbaste em metal.',
                'hourly_rate' => 55,
                'is_available' => true,
            ],
        );

        Rental::query()->updateOrCreate(
            [
                'tool_id' => $esmerilhadeiraAngular->id,
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
                'tool_id' => $maquinaSoldaArco->id,
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
                'tool_id' => $kitInstalacaoEletrica->id,
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

        $this->seedFerramentasAdicionaisCatalogo($admin->id);
        $this->seedCatalogoInicialImagens(
            $maquinaSoldaArco,
            $kitInstalacaoEletrica,
            $marteloUnha,
            $esmerilhadeiraAngular,
            $admin->id,
        );
    }

    /**
     * @return list<array{name: string, description: string, hourly_rate: float, image: string}>
     */
    private function ferramentasAdicionaisCatalogo(): array
    {
        return [
            [
                'name' => 'Serra Circular DeWalt 184mm',
                'description' => 'Serra circular profissional 184mm para cortes precisos em madeira.',
                'hourly_rate' => 45.0,
                'image' => 'serra-circular.jpg',
            ],
            [
                'name' => 'Escalímetro Arquitetônico Profissional',
                'description' => 'Escalímetro triangular para leitura de plantas e projetos arquitetônicos.',
                'hourly_rate' => 12.0,
                'image' => 'planta-arquitetonica.jpg',
            ],
            [
                'name' => 'Kit Artesanato com Base de Corte A2',
                'description' => 'Base de corte, tesoura, estilete e fitas para trabalhos artesanais.',
                'hourly_rate' => 18.0,
                'image' => 'kit-artesanato.jpg',
            ],
            [
                'name' => 'Inversora de Solda 160A',
                'description' => 'Inversora de solda eletrodo revestido 160A para uso doméstico.',
                'hourly_rate' => 32.0,
                'image' => 'solda-arco.jpg',
            ],
            [
                'name' => 'Multímetro Digital Profissional',
                'description' => 'Multímetro digital para medição de tensão, corrente e resistência.',
                'hourly_rate' => 5.0,
                'image' => 'instalacao-eletrica.jpg',
            ],
            [
                'name' => 'Martelo de Borracha 450g',
                'description' => 'Martelo de borracha para acabamento sem marcar superfícies.',
                'hourly_rate' => 8.0,
                'image' => 'martelo.jpg',
            ],
            [
                'name' => 'Esmerilhadeira Angular 750W',
                'description' => 'Esmerilhadeira angular 750W para corte pesado em aço.',
                'hourly_rate' => 48.0,
                'image' => 'esmerilhadeira.jpg',
            ],
            [
                'name' => 'Serra Circular Makita 190mm',
                'description' => 'Serra circular 190mm com guia paralela para marcenaria.',
                'hourly_rate' => 52.0,
                'image' => 'serra-circular.jpg',
            ],
            [
                'name' => 'Prancheta Arquitetônica A1',
                'description' => 'Prancheta A1 com clips para apoio de plantas e desenhos técnicos.',
                'hourly_rate' => 15.0,
                'image' => 'planta-arquitetonica.jpg',
            ],
            [
                'name' => 'Kit Scrapbook Profissional',
                'description' => 'Tesoura, cortador rotativo e fitas decorativas para scrapbook.',
                'hourly_rate' => 14.0,
                'image' => 'kit-artesanato.jpg',
            ],
            [
                'name' => 'Máquina de Solda MIG 200A',
                'description' => 'Solda MIG sem gás 200A para chapas finas e médias.',
                'hourly_rate' => 38.0,
                'image' => 'solda-arco.jpg',
            ],
            [
                'name' => 'Alicate Amperímetro Digital',
                'description' => 'Alicate amperímetro digital para medição em circuitos energizados.',
                'hourly_rate' => 22.0,
                'image' => 'instalacao-eletrica.jpg',
            ],
            [
                'name' => 'Martelo Unha 300g',
                'description' => 'Martelo unha compacto 300g para carpintaria e montagem.',
                'hourly_rate' => 6.0,
                'image' => 'martelo.jpg',
            ],
            [
                'name' => 'Esmerilhadeira Angular 4 Pol',
                'description' => 'Esmerilhadeira angular compacta 4 polegadas para uso doméstico.',
                'hourly_rate' => 35.0,
                'image' => 'esmerilhadeira.jpg',
            ],
            [
                'name' => 'Serra Circular Bosch 165mm',
                'description' => 'Serra circular 165mm leve para cortes rápidos em compensado.',
                'hourly_rate' => 42.0,
                'image' => 'serra-circular.jpg',
            ],
        ];
    }

    private function seedFerramentasAdicionaisCatalogo(int $adminUserId): void
    {
        foreach ($this->ferramentasAdicionaisCatalogo() as $ferramenta) {
            Tool::query()->updateOrCreate(
                ['name' => $ferramenta['name']],
                [
                    'owner_id' => $adminUserId,
                    'description' => $ferramenta['description'],
                    'hourly_rate' => $ferramenta['hourly_rate'],
                    'is_available' => true,
                ],
            );
        }
    }

    private function seedCatalogoInicialImagens(
        Tool $maquinaSoldaArco,
        Tool $kitInstalacaoEletrica,
        Tool $marteloUnha,
        Tool $esmerilhadeiraAngular,
        int $adminUserId,
    ): void {
        $this->syncToolImagesFromAssets($maquinaSoldaArco, [
            'solda-arco.jpg',
            'serra-circular.jpg',
        ]);

        $this->syncToolImagesFromAssets($kitInstalacaoEletrica, [
            'instalacao-eletrica.jpg',
            'planta-arquitetonica.jpg',
        ]);

        $this->syncToolImagesFromAssets($marteloUnha, [
            'martelo.jpg',
        ]);

        $this->syncToolImagesFromAssets($esmerilhadeiraAngular, [
            'esmerilhadeira.jpg',
            'kit-artesanato.jpg',
        ]);

        $ferramentasAdicionais = Tool::query()
            ->where('owner_id', $adminUserId)
            ->whereNotIn('name', self::NOMES_FERRAMENTAS_PRINCIPAIS)
            ->orderBy('id')
            ->get()
            ->keyBy('name');

        foreach ($this->ferramentasAdicionaisCatalogo() as $ferramenta) {
            $tool = $ferramentasAdicionais->get($ferramenta['name']);

            if ($tool === null) {
                continue;
            }

            $this->syncToolImagesFromAssets($tool, [$ferramenta['image']]);
        }
    }

    /**
     * @param  list<string>  $assetFilenames
     */
    private function syncToolImagesFromAssets(Tool $tool, array $assetFilenames): void
    {
        $filenames = array_values($assetFilenames);
        $assetsDir = database_path('seeders/assets/catalogo-inicial');
        $tool->images()->delete();
        $disk = Storage::disk('public');

        foreach ($filenames as $order => $filename) {
            $src = $assetsDir.DIRECTORY_SEPARATOR.$filename;

            if (! is_readable($src)) {
                continue;
            }

            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION) ?: 'jpg');
            $relative = 'tools/catalogo-inicial/'.$tool->id.'_'.$order.'.'.$ext;
            $disk->put($relative, file_get_contents($src));

            ToolImage::query()->create([
                'tool_id' => $tool->id,
                'path' => $relative,
                'sort_order' => $order * 10,
            ]);
        }
    }
}
