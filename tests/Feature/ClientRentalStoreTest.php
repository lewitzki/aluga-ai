<?php

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;

test('visitante é redirecionado ao login ao criar empréstimo', function () {
    $tool = Tool::factory()->create();

    $response = $this->post(route('catalog.rentals.store', $tool), [
        'starts_at' => '2031-01-10T09:00',
        'expected_ends_at' => '2031-01-11T09:00',
    ]);

    $response->assertRedirect(route('login'));
});

test('cliente cria empréstimo com período válido', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create([
        'hourly_rate' => 10,
        'is_available' => true,
    ]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-01-10T09:00',
            'expected_ends_at' => '2031-01-12T09:00',
        ])
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success');

    $rental = Rental::query()->where('tool_id', $tool->id)->first();

    expect($rental)->not->toBeNull()
        ->and($rental->client_id)->toBe($cliente->id)
        ->and($rental->status)->toBe(RentalStatus::Scheduled)
        ->and((string) $rental->hourly_rate_snapshot)->toBe('10.00')
        ->and((float) $rental->estimated_total)->toBe(480.0);
});

test('datas inconsistentes retornam erro de validação', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create();

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-01-12T09:00',
            'expected_ends_at' => '2031-01-10T09:00',
        ])
        ->assertSessionHasErrors('expected_ends_at');
});

test('ferramenta indisponível no cadastro retorna erro de validação', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => false]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-01-10T09:00',
            'expected_ends_at' => '2031-01-11T09:00',
        ])
        ->assertSessionHasErrors('starts_at');
});

test('período conflitante retorna erro de validação', function () {
    $cliente = User::factory()->cliente()->create();
    $other = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => true]);

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $other->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Scheduled,
    ]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-06-03T10:00',
            'expected_ends_at' => '2031-06-05T10:00',
        ])
        ->assertSessionHasErrors('starts_at');
});

test('admin recebe 403 ao criar empréstimo pelo fluxo do cliente', function () {
    $admin = User::factory()->admin()->create();
    $tool = Tool::factory()->create();

    $this->actingAs($admin)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-01-10T09:00',
            'expected_ends_at' => '2031-01-11T09:00',
        ])
        ->assertForbidden();
});

test('período imediatamente após empréstimo agendado é aceito', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => true]);

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Scheduled,
    ]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-06-07T18:00',
            'expected_ends_at' => '2031-06-10T10:00',
        ])
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success');
});

test('empréstimo finalizado não impede nova solicitação no mesmo período', function () {
    $cliente = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['is_available' => true]);

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Finished,
    ]);

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-06-03T10:00',
            'expected_ends_at' => '2031-06-05T10:00',
        ])
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success');
});
