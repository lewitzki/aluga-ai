<?php

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\User;
use App\Services\RentalClosureService;
use Carbon\Carbon;

test('calcula valor final com base em horas corridas e tarifa congelada', function () {
    $rental = Rental::factory()->make([
        'starts_at' => '2031-01-10 09:00:00',
        'hourly_rate_snapshot' => 10,
    ]);

    $service = app(RentalClosureService::class);
    $endedAt = Carbon::parse('2031-01-12 09:00:00');

    expect($service->calculateBillableHours($rental->starts_at, $endedAt))->toBe(48.0)
        ->and($service->calculateFinalTotal($rental, $endedAt))->toBe('480.00');
});

test('visitante é redirecionado ao login ao encerrar empréstimo', function () {
    $rental = Rental::factory()->create();

    $this->post(route('cliente.rentals.close', $rental))
        ->assertRedirect(route('login'));
});

test('cliente encerra próprio empréstimo ativo', function () {
    Carbon::setTestNow('2031-06-05 12:00:00');

    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Active,
        'hourly_rate_snapshot' => 10,
    ]);

    $this->actingAs($cliente)
        ->post(route('cliente.rentals.close', $rental))
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success');

    $rental->refresh();

    expect($rental->status)->toBe(RentalStatus::Finished)
        ->and($rental->ended_at)->not->toBeNull()
        ->and($rental->final_total)->not->toBeNull()
        ->and($rental->payment->status)->toBe(PaymentStatus::Approved)
        ->and($rental->payment->settled_at)->not->toBeNull()
        ->and($rental->payment->histories)->toHaveCount(2);

    Carbon::setTestNow();
});

test('cliente não encerra empréstimo de outro usuário', function () {
    $owner = User::factory()->cliente()->create();
    $other = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $owner->id,
        'status' => RentalStatus::Active,
    ]);

    $this->actingAs($other)
        ->post(route('cliente.rentals.close', $rental))
        ->assertForbidden();
});

test('não é possível encerrar empréstimo já finalizado', function () {
    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
        'ended_at' => now(),
        'final_total' => 100,
    ]);

    $this->actingAs($cliente)
        ->post(route('cliente.rentals.close', $rental))
        ->assertSessionHasErrors('rental');
});

test('encerramento no prazo define status finished e pagamento aprovado', function () {
    Carbon::setTestNow('2031-06-05 12:00:00');

    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Active,
        'hourly_rate_snapshot' => 10,
        'estimated_total' => 100,
    ]);

    $closed = app(RentalClosureService::class)->close($rental);

    expect($closed->status)->toBe(RentalStatus::Finished)
        ->and($closed->ended_at?->toDateTimeString())->toBe('2031-06-05 12:00:00')
        ->and((string) $closed->final_total)->toBe('980.00')
        ->and($closed->payment)->not->toBeNull()
        ->and($closed->payment->status)->toBe(PaymentStatus::Approved)
        ->and($closed->payment->settled_at)->not->toBeNull()
        ->and((string) $closed->payment->amount)->toBe('980.00')
        ->and($closed->payment->histories)->toHaveCount(2);

    Carbon::setTestNow();
});

test('encerramento após o prazo define status late', function () {
    Carbon::setTestNow('2031-06-08 10:00:00');

    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Active,
        'hourly_rate_snapshot' => 10,
    ]);

    $closed = app(RentalClosureService::class)->close($rental);

    expect($closed->status)->toBe(RentalStatus::Late)
        ->and((string) $closed->final_total)->toBe('1680.00');

    Carbon::setTestNow();
});

test('admin recebe 403 ao encerrar pelo fluxo do cliente', function () {
    $admin = User::factory()->admin()->create();
    $rental = Rental::factory()->create(['status' => RentalStatus::Active]);

    $this->actingAs($admin)
        ->post(route('cliente.rentals.close', $rental))
        ->assertForbidden();
});

test('painel expõe can_close para empréstimos abertos', function () {
    $cliente = User::factory()->cliente()->create();

    Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
    ]);

    Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
        'ended_at' => now(),
        'final_total' => 50,
    ]);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('active_rentals', 1)
            ->where('active_rentals.0.can_close', true)
            ->has('history_rentals', 1)
            ->where('history_rentals.0.can_close', false));
});
