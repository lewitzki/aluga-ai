<?php

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;

test('fluxo completo cliente: registro, catálogo, empréstimo e pagamento mockado', function () {
    $this->skipUnlessFortifyHas(Features::registration());

    Carbon::setTestNow('2031-06-01 08:00:00');

    $admin = User::factory()->admin()->create();
    $tool = Tool::factory()->create([
        'user_id' => $admin->id,
        'name' => 'Serra Integração Fluxo',
        'description' => 'token_integracao_cliente_xyz',
        'hourly_rate' => 20,
        'is_available' => true,
    ]);

    $this->post(route('register.store'), [
        'name' => 'Cliente Integração',
        'email' => 'cliente.integracao@teste.local',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $cliente = User::query()->where('email', 'cliente.integracao@teste.local')->firstOrFail();

    expect($cliente->profile)->toBe(User::PROFILE_CLIENTE);

    $this->actingAs($cliente)
        ->get(route('catalog.index', ['descricao' => 'token_integracao_cliente_xyz']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog')
            ->has('tools.data', 1)
            ->where('tools.data.0.name', 'Serra Integração Fluxo'));

    $this->actingAs($cliente)
        ->get(route('catalog.show', $tool))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('catalog/show')
            ->where('tool.id', $tool->id));

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-06-01T10:00',
            'expected_ends_at' => '2031-06-02T18:00',
        ])
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success');

    $rental = Rental::query()
        ->where('client_id', $cliente->id)
        ->where('tool_id', $tool->id)
        ->firstOrFail();

    expect($rental->status)->toBe(RentalStatus::Scheduled);

    Carbon::setTestNow('2031-06-02 12:00:00');

    $this->actingAs($cliente)
        ->post(route('cliente.rentals.close', $rental))
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success', fn ($message) => str_contains($message, 'Pagamento aprovado'));

    $rental->refresh()->load('payment.histories');

    expect($rental->status)->toBe(RentalStatus::Finished)
        ->and($rental->payment)->not->toBeNull()
        ->and($rental->payment->status)->toBe(PaymentStatus::Approved)
        ->and($rental->payment->settled_at)->not->toBeNull()
        ->and($rental->payment->histories)->toHaveCount(2);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cliente/dashboard')
            ->where('summary.total_paid', fn ($total) => (float) $total > 0)
            ->has('history_rentals', 1)
            ->where('history_rentals.0.id', $rental->id));

    Carbon::setTestNow();
});

test('fluxo completo cliente via login: catálogo, empréstimo e pagamento mockado', function () {
    Carbon::setTestNow('2031-07-01 08:00:00');

    $cliente = User::factory()->cliente()->create([
        'email' => 'cliente.login.fluxo@teste.local',
    ]);

    $admin = User::factory()->admin()->create();
    $tool = Tool::factory()->create([
        'user_id' => $admin->id,
        'name' => 'Compactador Fluxo Login',
        'hourly_rate' => 15,
        'is_available' => true,
    ]);

    $this->post(route('login.store'), [
        'email' => 'cliente.login.fluxo@teste.local',
        'password' => 'password',
    ])->assertRedirect(route('cliente.dashboard'));

    $this->actingAs($cliente)
        ->get(route('catalog.show', $tool))
        ->assertOk();

    $this->actingAs($cliente)
        ->post(route('catalog.rentals.store', $tool), [
            'starts_at' => '2031-07-01T09:00',
            'expected_ends_at' => '2031-07-01T17:00',
        ])
        ->assertRedirect(route('cliente.dashboard'));

    $rental = Rental::query()->where('client_id', $cliente->id)->firstOrFail();

    Carbon::setTestNow('2031-07-01 17:30:00');

    $this->actingAs($cliente)
        ->post(route('cliente.rentals.close', $rental))
        ->assertRedirect(route('cliente.dashboard'));

    $rental->refresh()->load('payment');

    expect($rental->payment->status)->toBe(PaymentStatus::Approved);

    Carbon::setTestNow();
});
