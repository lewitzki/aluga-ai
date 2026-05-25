<?php

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin visualiza painel financeiro com ganhos e historico', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create([
        'name' => 'Cliente Financeiro',
        'email' => 'cliente.financeiro@teste.local',
    ]);

    $tool = Tool::factory()->create(['name' => 'Betoneira Financeira']);

    $approvedRental = Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
        'final_total' => 1500,
    ]);

    Payment::factory()->create([
        'rental_id' => $approvedRental->id,
        'amount' => 1500,
        'status' => PaymentStatus::Approved,
        'settled_at' => now()->subDays(2),
    ]);

    $pendingRental = Rental::factory()->create([
        'tool_id' => Tool::factory()->create()->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
    ]);

    Payment::factory()->create([
        'rental_id' => $pendingRental->id,
        'amount' => 300,
        'status' => PaymentStatus::Pending,
        'settled_at' => null,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.finance'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/finance')
            ->where('summary.total_approved', '1500.00')
            ->where('summary.approved_count', 1)
            ->where('summary.pending_count', 1)
            ->where('summary.failed_count', 0)
            ->has('period_revenue', 1)
            ->has('payments.data', 2)
            ->where('payments.data', fn ($payments) => collect($payments)->contains(
                fn ($payment) => $payment['client']['email'] === 'cliente.financeiro@teste.local'
                    && $payment['tool']['name'] === 'Betoneira Financeira'
                    && $payment['rental']['id'] === $approvedRental->id
            ))
        );
});

test('admin filtra historico financeiro por status e intervalo de datas', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create();

    $oldRental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
    ]);

    Payment::factory()->create([
        'rental_id' => $oldRental->id,
        'amount' => 500,
        'status' => PaymentStatus::Approved,
        'settled_at' => '2026-01-15 10:00:00',
        'created_at' => '2026-01-15 10:00:00',
    ]);

    $recentRental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
    ]);

    Payment::factory()->create([
        'rental_id' => $recentRental->id,
        'amount' => 800,
        'status' => PaymentStatus::Approved,
        'settled_at' => '2026-05-10 10:00:00',
        'created_at' => '2026-05-10 10:00:00',
    ]);

    $failedRental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
    ]);

    Payment::factory()->create([
        'rental_id' => $failedRental->id,
        'amount' => 200,
        'status' => PaymentStatus::Failed,
        'settled_at' => '2026-05-12 10:00:00',
        'created_at' => '2026-05-12 10:00:00',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.finance', [
            'status' => 'approved',
            'from' => '2026-05-01',
            'to' => '2026-05-31',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_approved', '800.00')
            ->where('summary.approved_count', 1)
            ->where('summary.failed_count', 0)
            ->has('payments.data', 1)
            ->where('payments.data.0.amount', '800.00')
        );
});

test('cliente recebe 403 ao acessar painel financeiro do admin', function () {
    $cliente = User::factory()->cliente()->create();

    $this->actingAs($cliente)
        ->get(route('admin.finance'))
        ->assertForbidden();
});

test('visitante e redirecionado ao login ao acessar painel financeiro do admin', function () {
    $this->get(route('admin.finance'))
        ->assertRedirect(route('login'));
});

test('cliente nao visualiza dados financeiros de outros clientes no painel proprio', function () {
    $cliente = User::factory()->cliente()->create();
    $outroCliente = User::factory()->cliente()->create([
        'name' => 'Outro Cliente',
        'email' => 'outro.cliente@teste.local',
    ]);

    $rentalProprio = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => RentalStatus::Finished,
    ]);

    Payment::factory()->create([
        'rental_id' => $rentalProprio->id,
        'amount' => 100,
        'status' => PaymentStatus::Approved,
        'settled_at' => now(),
    ]);

    $rentalOutro = Rental::factory()->create([
        'client_id' => $outroCliente->id,
        'status' => RentalStatus::Finished,
    ]);

    Payment::factory()->create([
        'rental_id' => $rentalOutro->id,
        'amount' => 999,
        'status' => PaymentStatus::Approved,
        'settled_at' => now(),
    ]);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('summary.total_paid', '100.00')
            ->has('history_rentals', 1)
            ->where('history_rentals.0.id', $rentalProprio->id)
        );
});
