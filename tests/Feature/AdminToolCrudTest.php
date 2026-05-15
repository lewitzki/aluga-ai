<?php

use App\Enums\RentalStatus;
use App\Models\Tool;
use App\Models\User;
use Database\Factories\RentalFactory;

test('cliente recebe 403 ao acessar listagem admin de ferramentas', function () {
    $cliente = User::factory()->cliente()->create();

    $this->actingAs($cliente)
        ->get(route('admin.tools.index'))
        ->assertForbidden();
});

test('admin lista apenas ferramentas que ele criou', function () {
    $adminA = User::factory()->admin()->create();
    $adminB = User::factory()->admin()->create();

    Tool::factory()->create([
        'user_id' => $adminA->id,
        'name' => 'Ferramenta do Admin A',
    ]);

    Tool::factory()->create([
        'user_id' => $adminB->id,
        'name' => 'Ferramenta do Admin B',
    ]);

    $response = $this->actingAs($adminA)->get(route('admin.tools.index'));

    $response->assertOk();

    $tools = $response->viewData('page')['props']['tools']['data'] ?? null;
    expect(is_array($tools))->toBeTrue();
    $names = collect($tools)->pluck('name')->all();
    expect($names)->toContain('Ferramenta do Admin A')
        ->not->toContain('Ferramenta do Admin B');
});

test('admin cria ferramenta', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.tools.store'), [
            'name' => 'Martelo Novo',
            'description' => 'Descrição nova',
            'hourly_rate' => '12.50',
            'is_available' => '1',
        ])
        ->assertRedirect(route('admin.tools.index'));

    $created = Tool::query()
        ->where('user_id', $admin->id)
        ->where('name', 'Martelo Novo')
        ->first();

    expect($created)->not->toBeNull()
        ->and((string) $created->hourly_rate)->toBe('12.50')
        ->and($created->is_available)->toBeTrue();

    $this->assertDatabaseHas('tools', [
        'id' => $created->id,
        'name' => 'Martelo Novo',
    ]);
});

test('admin atualiza ferramenta sem afetar vínculo com empréstimo', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create();

    $tool = Tool::factory()->create([
        'user_id' => $admin->id,
        'name' => 'Nome Antigo',
        'hourly_rate' => 40,
    ]);

    $rental = RentalFactory::new()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Scheduled,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.tools.update', $tool), [
            'name' => 'Nome Novo',
            'description' => 'Atualizada',
            'hourly_rate' => '99.00',
            'is_available' => '1',
        ])
        ->assertRedirect(route('admin.tools.edit', ['tool' => $tool->fresh()]));

    expect($tool->fresh()->name)->toBe('Nome Novo')
        ->and((string) $tool->fresh()->hourly_rate)->toBe('99.00');

    $this->assertDatabaseHas('rentals', [
        'id' => $rental->id,
        'tool_id' => $tool->id,
    ]);
});

test('admin não exclui ferramenta com empréstimo não finalizado', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create();

    $tool = Tool::factory()->create(['user_id' => $admin->id]);

    RentalFactory::new()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Scheduled,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.tools.destroy', $tool))
        ->assertRedirect(route('admin.tools.index'));

    expect(Tool::withTrashed()->find($tool->id)->trashed())->toBeFalse();
});

test('admin exclui ferramenta quando há apenas empréstimo finalizado', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create();

    $tool = Tool::factory()->create(['user_id' => $admin->id]);

    RentalFactory::new()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.tools.destroy', $tool))
        ->assertRedirect(route('admin.tools.index'));

    expect(Tool::withTrashed()->find($tool->id)?->trashed())->toBeTrue();
});

test('admin não remove ferramenta de outro usuário', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create();
    $tool = Tool::factory()->create(['user_id' => $other->id]);

    $this->actingAs($admin)
        ->delete(route('admin.tools.destroy', $tool))
        ->assertForbidden();
});

test('admin não edita ferramenta de outro usuário', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create();
    $tool = Tool::factory()->create(['user_id' => $other->id]);

    $this->actingAs($admin)
        ->put(route('admin.tools.update', $tool), [
            'name' => 'Tentativa invasão',
            'description' => null,
            'hourly_rate' => '1',
            'is_available' => '0',
        ])
        ->assertForbidden();
});
