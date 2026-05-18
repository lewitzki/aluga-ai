<?php

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('cliente visualiza painel com empréstimos ativos e histórico', function () {
    $cliente = User::factory()->cliente()->create();
    $toolActive = Tool::factory()->create(['name' => 'Furadeira Ativa']);
    $toolHistory = Tool::factory()->create(['name' => 'Betoneira Histórico']);

    Rental::factory()->create([
        'tool_id' => $toolActive->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
        'starts_at' => now()->subHours(2),
        'expected_ends_at' => now()->addHours(22),
    ]);

    Rental::factory()->create([
        'tool_id' => $toolHistory->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
        'starts_at' => now()->subDays(5),
        'expected_ends_at' => now()->subDays(3),
        'ended_at' => now()->subDays(3),
        'final_total' => 500,
    ]);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cliente/dashboard')
            ->has('active_rentals', 1)
            ->has('history_rentals', 1)
            ->where('active_rentals.0.tool.name', 'Furadeira Ativa')
            ->where('active_rentals.0.status', RentalStatus::Active->value)
            ->where('history_rentals.0.tool.name', 'Betoneira Histórico')
            ->where('history_rentals.0.status', RentalStatus::Finished->value)
        );
});

test('cliente visualiza total pago com base em pagamentos aprovados', function () {
    $cliente = User::factory()->cliente()->create();

    $approvedRental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
        'final_total' => 300,
    ]);

    $otherApprovedRental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
        'final_total' => 200,
    ]);

    $pendingRental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
    ]);

    Payment::factory()->create([
        'rental_id' => $approvedRental->id,
        'amount' => 300,
        'status' => PaymentStatus::Approved,
    ]);

    Payment::factory()->create([
        'rental_id' => $otherApprovedRental->id,
        'amount' => 200,
        'status' => PaymentStatus::Approved,
    ]);

    Payment::factory()->create([
        'rental_id' => $pendingRental->id,
        'amount' => 150,
        'status' => PaymentStatus::Pending,
    ]);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_paid', '500.00')
            ->where('summary.currency', 'BRL')
        );
});

test('cliente não visualiza empréstimos de outros usuários', function () {
    $cliente = User::factory()->cliente()->create();
    $other = User::factory()->cliente()->create();
    $tool = Tool::factory()->create(['name' => 'Ferramenta de Outro Cliente']);

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $other->id,
        'status' => RentalStatus::Active,
    ]);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('active_rentals', [])
            ->where('history_rentals', [])
            ->where('summary.total_paid', '0.00')
        );
});

test('admin recebe 403 ao acessar painel do cliente', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('cliente.dashboard'))
        ->assertForbidden();
});

test('visitante é redirecionado ao login ao acessar painel do cliente', function () {
    $this->get(route('cliente.dashboard'))
        ->assertRedirect(route('login'));
});
