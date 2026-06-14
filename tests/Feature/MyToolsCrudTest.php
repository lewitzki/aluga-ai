<?php

use App\Enums\RentalStatus;
use App\Models\Tool;
use App\Models\User;
use Database\Factories\RentalFactory;

test('cliente lista apenas ferramentas que ele cadastrou', function () {
    $clienteA = User::factory()->cliente()->create();
    $clienteB = User::factory()->cliente()->create();

    Tool::factory()->create([
        'owner_id' => $clienteA->id,
        'name' => 'Ferramenta do Cliente A',
    ]);

    Tool::factory()->create([
        'owner_id' => $clienteB->id,
        'name' => 'Ferramenta do Cliente B',
    ]);

    $response = $this->actingAs($clienteA)->get(route('my-tools.index'));

    $response->assertOk();

    $tools = $response->viewData('page')['props']['tools']['data'] ?? null;
    expect(is_array($tools))->toBeTrue();
    $names = collect($tools)->pluck('name')->all();
    expect($names)->toContain('Ferramenta do Cliente A')
        ->not->toContain('Ferramenta do Cliente B');
});

test('cliente cria ferramenta', function () {
    $cliente = User::factory()->cliente()->create();

    $this->actingAs($cliente)
        ->post(route('my-tools.store'), [
            'name' => 'Martelo Novo',
            'description' => 'Descrição nova',
            'hourly_rate' => '12.50',
            'is_available' => '1',
        ])
        ->assertRedirect(route('my-tools.index'));

    $created = Tool::query()
        ->where('owner_id', $cliente->id)
        ->where('name', 'Martelo Novo')
        ->first();

    expect($created)->not->toBeNull()
        ->and((string) $created->hourly_rate)->toBe('12.50')
        ->and($created->is_available)->toBeTrue();

    $this->assertDatabaseHas('tools', [
        'id' => $created->id,
        'name' => 'Martelo Novo',
        'owner_id' => $cliente->id,
    ]);
});

test('cliente não edita ferramenta de outro usuário', function () {
    $cliente = User::factory()->cliente()->create();
    $other = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['owner_id' => $other->id]);

    $this->actingAs($cliente)
        ->put(route('my-tools.update', $tool), [
            'name' => 'Tentativa invasão',
            'description' => 'Descrição inválida',
            'hourly_rate' => '1',
            'is_available' => '0',
        ])
        ->assertForbidden();
});

test('cliente não exclui ferramenta de outro usuário', function () {
    $cliente = User::factory()->cliente()->create();
    $other = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['owner_id' => $other->id]);

    $this->actingAs($cliente)
        ->delete(route('my-tools.destroy', $tool))
        ->assertForbidden();
});

test('cliente não exclui ferramenta com empréstimo não finalizado', function () {
    $cliente = User::factory()->cliente()->create();
    $renter = User::factory()->cliente()->create();

    $tool = Tool::factory()->create(['owner_id' => $cliente->id]);

    RentalFactory::new()->create([
        'tool_id' => $tool->id,
        'client_id' => $renter->id,
        'status' => RentalStatus::Scheduled,
    ]);

    $this->actingAs($cliente)
        ->delete(route('my-tools.destroy', $tool))
        ->assertRedirect(route('my-tools.index'));

    expect(Tool::withTrashed()->find($tool->id)->trashed())->toBeFalse();
});

test('dashboard do cliente exibe total de ferramentas cadastradas', function () {
    $cliente = User::factory()->cliente()->create();

    Tool::factory()->count(2)->create(['owner_id' => $cliente->id]);
    Tool::factory()->create(['owner_id' => User::factory()->cliente()->create()->id]);

    $response = $this->actingAs($cliente)->get(route('cliente.dashboard'));

    $response->assertOk();

    $summary = $response->viewData('page')['props']['summary'] ?? null;

    expect($summary)->toBeArray()
        ->and($summary['tools_count'])->toBe(2);
});
