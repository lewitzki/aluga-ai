<?php

namespace Database\Seeders;

use App\Models\Tool;
use App\Models\ToolImage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

/**
 * Popula o catálogo com produtos inspirados no site Palácio das Ferramentas
 * (palaciodasferramentas.com.br) para exibir uma versão demonstrativa
 * fiel em nome, descrição, valor e parcelamento. As imagens são copiadas
 * a partir do CDN público do site no momento do seed.
 *
 * Adaptações respeitando as regras de negócio do projeto Aluga-AI:
 * - "hourly_rate" assume o valor "à vista" exibido na vitrine.
 * - Não cria categorias, frete, favoritos, etc. (mantém apenas Tool/ToolImage).
 */
class PalacioCatalogSeeder extends Seeder
{
    private const CDN_BASE = 'https://palaciodasferramentas.com.br/media/catalog/product/';

    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@teste.local')->first();

        if (! $admin) {
            return;
        }

        $disk = Storage::disk('public');

        foreach ($this->products() as $product) {
            $tool = Tool::query()->updateOrCreate(
                ['name' => $product['name']],
                [
                    'owner_id' => $admin->id,
                    'description' => $product['description'],
                    'hourly_rate' => $product['hourly_rate'],
                    'is_available' => true,
                ],
            );

            $existing = $tool->images()->count();
            if ($existing > 0) {
                continue;
            }

            foreach ($product['images'] as $order => $relativePath) {
                $absoluteUrl = self::CDN_BASE.$relativePath;
                $bytes = $this->downloadImage($absoluteUrl);
                if ($bytes === null) {
                    continue;
                }

                $storagePath = 'tools/palacio/'.$tool->id.'_'.$order.'.jpg';
                $disk->put($storagePath, $bytes);

                ToolImage::query()->create([
                    'tool_id' => $tool->id,
                    'path' => $storagePath,
                    'sort_order' => $order * 10,
                ]);
            }
        }
    }

    private function downloadImage(string $url): ?string
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible; AlugaAISeeder/1.0)',
                'Accept' => 'image/jpeg,image/webp,image/*',
            ])
                ->withOptions(['verify' => false])
                ->timeout(20)
                ->retry(2, 250)
                ->get($url);

            if ($response->successful()) {
                return $response->body();
            }
        } catch (\Throwable) {
            // fallback abaixo
        }

        try {
            $context = stream_context_create([
                'http' => [
                    'timeout' => 20,
                    'header' => "User-Agent: Mozilla/5.0 (compatible; AlugaAISeeder/1.0)\r\n",
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $contents = @file_get_contents($url, false, $context);

            if (is_string($contents) && $contents !== '') {
                return $contents;
            }
        } catch (\Throwable) {
            // silenciamos: imagem indisponível não deve quebrar o seed
        }

        return null;
    }

    /**
     * Conjunto de produtos clonado do Palácio das Ferramentas (vitrine
     * "Ofertas da Semana", "Linha STIHL" e "Linha ZELT"), com valores e
     * condição de pagamento conforme apresentado no site oficial.
     *
     * @return list<array{name:string,description:string,hourly_rate:float,images:list<string>}>
     */
    private function products(): array
    {
        return [
            [
                'name' => 'Lavadora de Alta Pressão 1,7KW 110/220V Nova 19945520 KARCHER',
                'description' => 'Lavadora de Alta Pressão 1700W 1885 Libras K4 KARCHER. Indicada para uso doméstico exigente e pequenos profissionais. Bivolt (110V/220V). 10x sem juros no cartão ou 17% OFF à vista.',
                'hourly_rate' => 1014.90,
                'images' => ['1/_/1_2799_1.jpg'],
            ],
            [
                'name' => 'Climatizador de Ar 3 Velocidades 60 Litros 150W VENTISOL',
                'description' => 'Climatizador de Ar com 3 velocidades, reservatório de 60 litros e potência de 150W. Ideal para ambientes médios. 10x sem juros no cartão ou 12% OFF à vista.',
                'hourly_rate' => 876.00,
                'images' => ['8/5/85284_01.jpg'],
            ],
            [
                'name' => 'Máquina de Pintura Airless 1,3 HP 1000W 3000 PSI EMPA-1000 EVALD',
                'description' => 'Máquina de Pintura Airless EMPA-1000 EVALD com 1,3 HP, 1000W e 3000 PSI. Ideal para grandes superfícies. 10x sem juros no cartão ou 16% OFF à vista.',
                'hourly_rate' => 1039.00,
                'images' => ['5/_/5_2687.jpg'],
            ],
            [
                'name' => 'Gerador Gasolina 1 KVA Monofásico com Carregador de Bateria TG1200CXH TOYAMA',
                'description' => 'Gerador a gasolina de 1 KVA monofásico com carregador de bateria embutido. Modelo TG1200CXH TOYAMA. 10x sem juros no cartão ou 10% OFF à vista.',
                'hourly_rate' => 998.90,
                'images' => ['D/S/DSYATTVWFVBNBUAQMHFH.jpg'],
            ],
            [
                'name' => 'Bomba d\'Água Periférica 0,5 CV Acquapump FERRARI',
                'description' => 'Bomba d\'Água Periférica de 0,5 CV linha Acquapump FERRARI. Recomendada para residências e pequenos sistemas hidráulicos. 5x sem juros no cartão ou 11% OFF à vista.',
                'hourly_rate' => 146.89,
                'images' => ['0/6/06013875d0-000_01.jpg'],
            ],
            [
                'name' => 'Pistola de Pintura à Bateria 18v sem Bateria e Carregador VONDER',
                'description' => 'Pistola de Pintura à Bateria 18V VONDER (acompanha equipamento, sem bateria e sem carregador). 10x sem juros no cartão ou 12% OFF à vista.',
                'hourly_rate' => 349.00,
                'images' => ['1/_/1_2813_1.jpg'],
            ],
            [
                'name' => 'Triturador Forrageiro Monofásico 1,5CV 60Hz TRF-50 TRAPP',
                'description' => 'Triturador Forrageiro Monofásico TRF-50 da TRAPP, 1,5 CV e 60 Hz. Robusto para uso agrícola. 10x sem juros no cartão ou 14% OFF à vista.',
                'hourly_rate' => 1772.90,
                'images' => ['1/_/1_2801_1.jpg'],
            ],
            [
                'name' => 'Compressor Ar Direto 1/2HP 1/2 Polegada 350W Kit 9 Acessórios Bivolt ECAD-350-03 EVALD',
                'description' => 'Compressor Ar Direto ECAD-350-03 EVALD. Acompanha kit com 9 acessórios. Bivolt, 350W, 1/2 HP e 1/2 polegada. 10x sem juros no cartão ou 12% OFF.',
                'hourly_rate' => 489.00,
                'images' => ['2/_/2_516.jpg'],
            ],
            [
                'name' => 'Jogo com 5 Acessórios de Pintura para Compressor TEKNA',
                'description' => 'Conjunto com 5 acessórios de pintura para compressor TEKNA. Avaliações positivas (100%). 4x sem juros no cartão ou 18% OFF à vista.',
                'hourly_rate' => 126.90,
                'images' => ['1/_/1_521.jpg'],
            ],
            [
                'name' => 'Bomba Submersível Para Água Suja 1,0 CV Premium Mono ZXW750-A FERRARI',
                'description' => 'Bomba Submersível ZXW750-A FERRARI 1,0 CV linha Premium para água suja. Mono. 10x sem juros no cartão ou 16% OFF à vista.',
                'hourly_rate' => 409.00,
                'images' => ['1/_/1_885_9.jpg'],
            ],

            // Linha STIHL — Últimas unidades
            [
                'name' => 'Motosserra a Bateria Sabre 30cm 36V MSA 160 C-B sem Bateria STIHL',
                'description' => 'Motosserra a Bateria STIHL MSA 160 C-B, sabre de 30 cm e 36V. Não acompanha bateria. 10x sem juros no cartão ou 16% OFF à vista.',
                'hourly_rate' => 1766.90,
                'images' => ['1/_/1_2747.jpg'],
            ],
            [
                'name' => 'Motor Gasolina 6 HP 4 Tempos Partida Manual Multiuso EHC 605 S STIHL',
                'description' => 'Motor a gasolina STIHL EHC 605 S, 6 HP, 4 tempos, partida manual e uso multiuso. 10x sem juros no cartão ou 13% OFF à vista.',
                'hourly_rate' => 1250.90,
                'images' => ['7/8/78938_1.jpg'],
            ],
            [
                'name' => 'Cortador de Grama a Bateria Sem Carregador e Bateria RMA 510 STIHL',
                'description' => 'Cortador de Grama a Bateria STIHL RMA 510 (sem carregador e sem bateria). 10x sem juros no cartão.',
                'hourly_rate' => 3581.10,
                'images' => ['1/_/1_413.jpg'],
            ],
            [
                'name' => 'Cortador de Grama a Bateria Sem Carregador e Bateria RMA 235.1 STIHL',
                'description' => 'Cortador de Grama a Bateria STIHL RMA 235.1 (sem carregador e sem bateria). 10x sem juros no cartão ou 12% OFF à vista.',
                'hourly_rate' => 1372.90,
                'images' => ['1/_/1_1739.jpg'],
            ],
            [
                'name' => 'Lavadora de Alta Pressão 1.5 Kw RE80 STIHL',
                'description' => 'Lavadora de Alta Pressão STIHL RE80, 1.5 KW. Robusta para uso doméstico e semi-profissional. 10x sem juros ou 13% OFF à vista.',
                'hourly_rate' => 864.90,
                'images' => ['N/I/NIJPKNGLTJEYTBZXAZEA.jpg'],
            ],
            [
                'name' => 'Podador a Gasolina 1 CV 22,7 CC HS 82 R STIHL',
                'description' => 'Podador a gasolina STIHL HS 82 R, 1 CV e 22,7 CC. 10x sem juros no cartão ou 25% OFF à vista.',
                'hourly_rate' => 2858.90,
                'images' => ['7/9/79791_1_1_1_.jpg'],
            ],
            [
                'name' => 'Roçadeira a Bateria FSA 86 R STIHL sem Bateria e sem Carregador',
                'description' => 'Roçadeira a Bateria STIHL FSA 86 R (não acompanha bateria nem carregador). 10x sem juros no cartão.',
                'hourly_rate' => 1879.00,
                'images' => ['1/_/1_2712.jpg'],
            ],
            [
                'name' => 'Roçadeira Combustão a Gasolina 1,3 CV 25 CC Lâmina 3 Facas FS 80 STIHL',
                'description' => 'Roçadeira a gasolina STIHL FS 80, 1,3 CV e 25 CC, com lâmina de 3 facas. 10x sem juros no cartão.',
                'hourly_rate' => 1839.00,
                'images' => ['1/_/1_2797.jpg'],
            ],
        ];
    }
}
