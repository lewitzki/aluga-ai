<?php

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Database\Factories\ToolImageFactory;
use Inertia\Testing\AssertableInertia as Assert;

function inertiaProps($response): array
{
    $page = $response->viewData('page');

    return json_decode(json_encode($page), true);
}

test('visitante acessa o catálogo sem autenticação', function () {
    $response = $this->get(route('catalog.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog')
            ->has('filters')
            ->has('tools.data'));
});

test('filtro por descrição combina nome e texto da descrição', function () {
    Tool::factory()->create([
        'name' => 'Chave AlphaCat123',
        'description' => 'Outro texto',
        'hourly_rate' => 10,
        'is_available' => true,
    ]);

    Tool::factory()->create([
        'name' => 'Outra coisa',
        'description' => 'AlphaCat123 na descrição',
        'hourly_rate' => 11,
        'is_available' => true,
    ]);

    Tool::factory()->create([
        'name' => 'Sem match',
        'description' => 'nada aqui',
        'hourly_rate' => 12,
        'is_available' => true,
    ]);

    $response = $this->get(route('catalog.index', [
        'descricao' => 'AlphaCat123',
    ]));

    $response->assertOk();

    $props = inertiaProps($response);
    expect($props['props']['tools']['data'])->toHaveCount(2);
});

test('filtro por faixa de preço por hora', function () {
    Tool::factory()->create(['hourly_rate' => 10, 'name' => 'Barato']);
    Tool::factory()->create(['hourly_rate' => 50, 'name' => 'Médio']);
    Tool::factory()->create(['hourly_rate' => 90, 'name' => 'Caro']);

    $response = $this->get(route('catalog.index', [
        'preco_min' => 15,
        'preco_max' => 60,
    ]));

    $props = inertiaProps($response);

    expect(collect($props['props']['tools']['data'])->pluck('name')->all())
        ->toContain('Médio')
        ->not->toContain('Barato')
        ->not->toContain('Caro');
});

test('filtro disponível sim oculta ferramentas marcadas como indisponíveis', function () {
    Tool::factory()->create([
        'name' => 'Disponível OK',
        'is_available' => true,
    ]);

    Tool::factory()->create([
        'name' => 'Indisponível Cadastro',
        'is_available' => false,
    ]);

    $response = $this->get(route('catalog.index', ['disponivel' => 'sim']));

    $props = inertiaProps($response);

    $names = collect($props['props']['tools']['data'])->pluck('name')->all();

    expect($names)->toContain('Disponível OK')
        ->not->toContain('Indisponível Cadastro');
});

test('ferramenta com empréstimo finalizado aparece quando período coincide', function () {
    $admin = User::factory()->admin()->create();

    $tool = Tool::factory()->create([
        'owner_id' => $admin->id,
        'name' => 'Livre Após Finalizado',
        'is_available' => true,
    ]);

    $cliente = User::factory()->cliente()->create();

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'starts_at' => '2030-06-01 10:00:00',
        'expected_ends_at' => '2030-06-30 18:00:00',
        'status' => RentalStatus::Finished,
    ]);

    $response = $this->get(route('catalog.index', [
        'periodo_inicio' => '2030-06-10 08:00:00',
        'periodo_fim' => '2030-06-15 20:00:00',
    ]));

    $props = inertiaProps($response);
    $ids = collect($props['props']['tools']['data'])->pluck('id')->all();

    expect($ids)->toContain($tool->id);
});

test('ferramenta com empréstimo sobreposto não aparece quando período coincide', function () {
    $admin = User::factory()->admin()->create();

    $livre = Tool::factory()->create([
        'owner_id' => $admin->id,
        'name' => 'Sem Conflito',
        'is_available' => true,
    ]);

    $ocupada = Tool::factory()->create([
        'owner_id' => $admin->id,
        'name' => 'Com Conflito',
        'is_available' => true,
    ]);

    $cliente = User::factory()->cliente()->create();

    Rental::factory()->create([
        'tool_id' => $ocupada->id,
        'client_id' => $cliente->id,
        'starts_at' => '2030-06-01 10:00:00',
        'expected_ends_at' => '2030-06-30 18:00:00',
        'ended_at' => null,
        'status' => RentalStatus::Scheduled,
    ]);

    $response = $this->get(route('catalog.index', [
        'periodo_inicio' => '2030-06-10 08:00:00',
        'periodo_fim' => '2030-06-15 20:00:00',
    ]));

    $props = inertiaProps($response);

    $ids = collect($props['props']['tools']['data'])->pluck('id')->all();

    expect($ids)->toContain($livre->id)
        ->not->toContain($ocupada->id);
});

test('paginação preserva filtros na URL das páginas', function () {
    Tool::factory()->count(15)->create([
        'name' => 'Pag Tool Batch',
        'hourly_rate' => 20,
        'is_available' => true,
    ]);

    $response = $this->get(route('catalog.index', [
        'descricao' => 'Pag Tool Batch',
        'disponivel' => 'sim',
    ]));

    $props = inertiaProps($response);

    expect($props['props']['tools']['last_page'])->toBeGreaterThan(1);

    $next = $props['props']['tools']['next_page_url'];

    expect($next)->not->toBeNull()
        ->and($next)->toContain('descricao=')
        ->and($next)->toContain('disponivel=');
});

test('visitante acessa detalhe de ferramenta existente', function () {
    $tool = Tool::factory()->create([
        'name' => 'Ferramenta Detalhe Pública',
        'description' => 'Descrição completa para a página de detalhe.',
        'hourly_rate' => 33,
        'is_available' => true,
    ]);

    $response = $this->get(route('catalog.show', $tool));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show'));

    $props = inertiaProps($response);

    expect($props['props']['tool']['id'])->toBe($tool->id)
        ->and($props['props']['tool']['name'])->toBe('Ferramenta Detalhe Pública')
        ->and($props['props']['canRequestRental'])->toBeFalse();
});

test('detalhe serializa imagens em ordem', function () {
    $tool = Tool::factory()->create(['name' => 'Com fotos']);

    ToolImageFactory::new()->create([
        'tool_id' => $tool->id,
        'path' => 'tools/second.jpg',
        'sort_order' => 20,
    ]);

    ToolImageFactory::new()->create([
        'tool_id' => $tool->id,
        'path' => 'tools/first.jpg',
        'sort_order' => 5,
    ]);

    $response = $this->get(route('catalog.show', $tool));

    $props = inertiaProps($response);
    $urls = collect($props['props']['tool']['images'])->pluck('url')->all();

    expect($urls)->toHaveCount(2)
        ->and($urls[0])->toContain('first.jpg')
        ->and($urls[1])->toContain('second.jpg');
});

test('ferramenta inexistente retorna 404 com página Inertia', function () {
    $this->get('/catalogo/999999999')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('errors/not-found'));
});

test('ferramenta excluída (soft delete) não tem detalhe público', function () {
    $tool = Tool::factory()->create();
    $tool->delete();

    $this->get(route('catalog.show', $tool))->assertNotFound();
});

test('cliente autenticado pode solicitar empréstimo na página de detalhe', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => true]);

    $response = $this->actingAs($cliente)->get(route('catalog.show', $tool));

    $response->assertOk();

    $props = inertiaProps($response);

    expect($props['props']['canRequestRental'])->toBeTrue();
});

test('cliente autenticado não solicita empréstimo quando ferramenta está indisponível no cadastro', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => false]);

    $response = $this->actingAs($cliente)->get(route('catalog.show', $tool));

    $response->assertOk();

    $props = inertiaProps($response);

    expect($props['props']['canRequestRental'])->toBeFalse();
});
