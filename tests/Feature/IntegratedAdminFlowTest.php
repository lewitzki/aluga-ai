<?php

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('fluxo completo admin: CRUD ferramenta e painéis operacional e financeiro', function () {
    $admin = User::factory()->admin()->create();
    $cliente = User::factory()->cliente()->create([
        'name' => 'Cliente Admin Fluxo',
        'email' => 'cliente.admin.fluxo@teste.local',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.tools.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/tools/index')
            ->has('tools.data'));

    $this->actingAs($admin)
        ->post(route('admin.tools.store'), [
            'name' => 'Martelo Fluxo Admin',
            'description' => 'Ferramenta criada no fluxo integrado',
            'hourly_rate' => '35.00',
            'is_available' => '1',
        ])
        ->assertRedirect(route('admin.tools.index'));

    $tool = Tool::query()
        ->where('user_id', $admin->id)
        ->where('name', 'Martelo Fluxo Admin')
        ->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.tools.update', $tool), [
            'name' => 'Martelo Fluxo Admin Atualizado',
            'description' => 'Descrição revisada',
            'hourly_rate' => '40.00',
            'is_available' => '1',
        ])
        ->assertRedirect(route('admin.tools.edit', ['tool' => $tool->fresh()]));

    expect($tool->fresh()->name)->toBe('Martelo Fluxo Admin Atualizado');

    $rental = Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'status' => RentalStatus::Active,
        'starts_at' => now()->subHours(2),
        'expected_ends_at' => now()->addHours(22),
        'hourly_rate_snapshot' => 40,
    ]);

    Payment::factory()->create([
        'rental_id' => $rental->id,
        'amount' => 80,
        'status' => PaymentStatus::Approved,
        'settled_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('summary.total', fn ($total) => $total >= 1)
            ->has('active_rentals', 1)
            ->where('active_rentals.0.tool.name', 'Martelo Fluxo Admin Atualizado')
            ->where('active_rentals.0.client.email', 'cliente.admin.fluxo@teste.local'));

    $this->actingAs($admin)
        ->get(route('admin.finance'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/finance')
            ->where('summary.total_approved', '80.00')
            ->where('summary.approved_count', 1)
            ->has('payments.data', 1)
            ->where('payments.data.0.tool.name', 'Martelo Fluxo Admin Atualizado'));

    $rental->update([
        'status' => RentalStatus::Finished,
        'ended_at' => now(),
        'final_total' => 80,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.tools.destroy', $tool))
        ->assertRedirect(route('admin.tools.index'));

    expect(Tool::withTrashed()->find($tool->id)?->trashed())->toBeTrue();
});

test('fluxo admin via login redireciona para painel operacional', function () {
    $admin = User::factory()->admin()->create([
        'email' => 'admin.login.fluxo@teste.local',
    ]);

    $this->post(route('login.store'), [
        'email' => 'admin.login.fluxo@teste.local',
        'password' => 'password',
    ])->assertRedirect(route('admin.dashboard'));

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/dashboard'));
});
