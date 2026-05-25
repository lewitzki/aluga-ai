<?php

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin visualiza painel operacional com resumo e listas', function () {
    $admin = User::factory()->admin()->create();

    $availableTool = Tool::factory()->create([
        'name' => 'Martelo Disponível',
        'is_available' => true,
    ]);

    $unavailableTool = Tool::factory()->create([
        'name' => 'Serra Indisponível',
        'is_available' => false,
    ]);

    $rentedTool = Tool::factory()->create([
        'name' => 'Furadeira Emprestada',
        'is_available' => true,
    ]);

    $cliente = User::factory()->cliente()->create([
        'name' => 'Cliente Ativo',
        'email' => 'cliente.ativo@teste.local',
    ]);

    Rental::factory()->create([
        'tool_id' => $rentedTool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
        'starts_at' => now()->subHours(2),
        'expected_ends_at' => now()->addHours(22),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('summary.total', 3)
            ->where('summary.available', 1)
            ->where('summary.rented', 1)
            ->has('tools', 3)
            ->has('active_rentals', 1)
            ->where('active_rentals.0.tool.name', 'Furadeira Emprestada')
            ->where('active_rentals.0.client.email', 'cliente.ativo@teste.local')
            ->where('active_rentals.0.status', RentalStatus::Active->value)
        );
});

test('admin filtra ferramentas por estado operacional', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create();

    Tool::factory()->create(['name' => 'Disponível A', 'is_available' => true]);
    Tool::factory()->create(['name' => 'Indisponível B', 'is_available' => false]);

    $rentedTool = Tool::factory()->create(['name' => 'Emprestada C', 'is_available' => true]);

    Rental::factory()->create([
        'tool_id' => $rentedTool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard', ['estado_ferramenta' => 'emprestada']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('tools', 1)
            ->where('tools.0.name', 'Emprestada C')
            ->where('tools.0.operational_status', 'emprestada')
        );
});

test('admin filtra empréstimos ativos por status e busca textual', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create([
        'name' => 'Maria Silva',
        'email' => 'maria.silva@teste.local',
    ]);

    $activeTool = Tool::factory()->create(['name' => 'Betoneira Ativa']);
    $scheduledTool = Tool::factory()->create(['name' => 'Compactador Agendado']);

    Rental::factory()->create([
        'tool_id' => $activeTool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
        'starts_at' => now()->subHour(),
        'expected_ends_at' => now()->addDay(),
    ]);

    Rental::factory()->create([
        'tool_id' => $scheduledTool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Scheduled,
        'starts_at' => now()->addDay(),
        'expected_ends_at' => now()->addDays(2),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard', [
            'status' => 'active',
            'q' => 'maria',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('active_rentals', 1)
            ->where('active_rentals.0.tool.name', 'Betoneira Ativa')
            ->where('active_rentals.0.status', RentalStatus::Active->value)
        );
});

test('cliente recebe 403 ao acessar painel operacional do admin', function () {
    $cliente = User::factory()->cliente()->create();

    $this->actingAs($cliente)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('visitante é redirecionado ao login ao acessar painel operacional do admin', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});
