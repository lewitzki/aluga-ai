<?php

use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;

test('cliente recebe 403 ao acessar CRUD admin de ferramentas', function () {
    $cliente = User::factory()->cliente()->create();

    $this->actingAs($cliente)
        ->get(route('admin.tools.index'))
        ->assertForbidden();

    $this->actingAs($cliente)
        ->post(route('admin.tools.store'), [
            'name' => 'Tentativa',
            'hourly_rate' => '10',
            'is_available' => '1',
        ])
        ->assertForbidden();
});

test('cliente recebe 403 ao acessar painéis operacional e financeiro do admin', function () {
    $cliente = User::factory()->cliente()->create();

    $this->actingAs($cliente)
        ->get(route('admin.dashboard'))
        ->assertForbidden();

    $this->actingAs($cliente)
        ->get(route('admin.finance'))
        ->assertForbidden();
});

test('admin recebe 403 ao acessar fluxos exclusivos do cliente', function () {
    $admin = User::factory()->admin()->create();
    $tool = Tool::factory()->create();

    $this->actingAs($admin)
        ->get(route('cliente.dashboard'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-01-10T09:00',
            'expected_ends_at' => '2031-01-11T09:00',
        ])
        ->assertForbidden();
});

test('ferramenta indisponível no cadastro impede empréstimo', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => false]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-01-10T09:00',
            'expected_ends_at' => '2031-01-11T09:00',
        ])
        ->assertSessionHasErrors('starts_at');
});

test('período conflitante impede nova solicitação de empréstimo', function () {
    $cliente = User::factory()->cliente()->create();
    $other = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => true]);

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $other->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
    ]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-06-03T10:00',
            'expected_ends_at' => '2031-06-05T10:00',
        ])
        ->assertSessionHasErrors('starts_at');
});

test('ferramenta indisponível no cadastro não aparece com filtro disponível sim', function () {
    Tool::factory()->create([
        'name' => 'Visível Integração',
        'is_available' => true,
    ]);

    Tool::factory()->create([
        'name' => 'Oculta Integração',
        'is_available' => false,
    ]);

    $response = $this->get(route('catalog.index', ['disponivel' => 'sim']));

    $response->assertOk();

    $tools = $response->viewData('page')['props']['tools']['data'] ?? [];
    $names = collect($tools)->pluck('name')->all();

    expect($names)->toContain('Visível Integração')
        ->not->toContain('Oculta Integração');
});
