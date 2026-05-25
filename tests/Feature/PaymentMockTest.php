<?php

use App\Contracts\PaymentGateway;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\PaymentHistory;
use App\Models\Rental;
use App\Models\User;
use App\Services\Payment\MockPaymentGateway;
use App\Services\Payment\PaymentChargeResult;
use App\Services\Payment\PaymentGatewayManager;
use App\Services\PaymentService;
use App\Services\RentalClosureService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;

test('fechamento gera tentativa de pagamento mockado com historico', function () {
    Carbon::setTestNow('2031-06-05 12:00:00');

    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => \App\Enums\RentalStatus::Active,
        'hourly_rate_snapshot' => 10,
    ]);

    $closed = app(RentalClosureService::class)->close($rental);

    expect($closed->payment)->not->toBeNull()
        ->and($closed->payment->status)->toBe(PaymentStatus::Approved)
        ->and($closed->payment->settled_at)->not->toBeNull()
        ->and($closed->payment->histories)->toHaveCount(2)
        ->and($closed->payment->histories->first()->status)->toBe(PaymentStatus::Pending)
        ->and($closed->payment->histories->last()->status)->toBe(PaymentStatus::Approved)
        ->and($closed->payment->histories->last()->metadata)->toHaveKeys([
            'gateway',
            'transaction_id',
            'phase',
        ]);

    Carbon::setTestNow();
});

test('pagamento aprovado entra no total pago do cliente', function () {
    Carbon::setTestNow('2031-06-05 12:00:00');

    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => \App\Enums\RentalStatus::Active,
        'hourly_rate_snapshot' => 50,
    ]);

    app(RentalClosureService::class)->close($rental);

    $this->actingAs($cliente)
        ->get(route('cliente.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.total_paid', '4900.00'));

    Carbon::setTestNow();
});

test('pagamento mockado pode falhar conforme configuracao', function () {
    Config::set('payment.mock.default_status', PaymentStatus::Failed->value);

    $cliente = User::factory()->cliente()->create();
    $rental = Rental::factory()->create([
        'client_id' => $cliente->id,
        'status' => \App\Enums\RentalStatus::Active,
        'hourly_rate_snapshot' => 10,
    ]);

    $this->actingAs($cliente)
        ->post(route('cliente.rentals.close', $rental))
        ->assertRedirect(route('cliente.dashboard'))
        ->assertSessionHas('success', fn ($message) => str_contains($message, 'recusado'));

    $rental->refresh()->load('payment.histories');

    expect($rental->payment->status)->toBe(PaymentStatus::Failed)
        ->and($rental->payment->settled_at)->toBeNull()
        ->and($rental->payment->histories->last()->status)->toBe(PaymentStatus::Failed);

    Config::set('payment.mock.default_status', PaymentStatus::Approved->value);
});

test('pagamento mockado pode permanecer pendente conforme configuracao', function () {
    Config::set('payment.mock.default_status', PaymentStatus::Pending->value);

    $rental = Rental::factory()->create([
        'status' => \App\Enums\RentalStatus::Active,
        'hourly_rate_snapshot' => 10,
    ]);

    $closed = app(RentalClosureService::class)->close($rental);

    expect($closed->payment->status)->toBe(PaymentStatus::Pending)
        ->and($closed->payment->settled_at)->toBeNull();

    Config::set('payment.mock.default_status', PaymentStatus::Approved->value);
});

test('contrato de gateway permite substituir implementacao mockada', function () {
    $fakeGateway = new class implements PaymentGateway
    {
        public function charge(Payment $payment): PaymentChargeResult
        {
            return new PaymentChargeResult(
                status: PaymentStatus::Approved,
                metadata: ['gateway' => 'fake-test'],
                transactionId: 'fake_tx_1',
            );
        }
    };

    $this->app->instance(PaymentGateway::class, $fakeGateway);

    $payment = Payment::factory()->create([
        'status' => PaymentStatus::Pending,
        'settled_at' => null,
    ]);

    $processed = app(PaymentService::class)->processCharge($payment);

    expect($processed->status)->toBe(PaymentStatus::Approved)
        ->and($processed->histories->last()->metadata['gateway'])->toBe('fake-test')
        ->and($processed->histories->last()->metadata['transaction_id'])->toBe('fake_tx_1');
});

test('mock payment gateway retorna metadados de simulacao', function () {
    $payment = Payment::factory()->make([
        'amount' => 123.45,
        'currency' => 'BRL',
    ]);

    $result = app(MockPaymentGateway::class)->charge($payment);

    expect($result->status)->toBe(PaymentStatus::Approved)
        ->and($result->metadata['gateway'])->toBe('mock')
        ->and($result->transactionId)->toStartWith('mock_');
});

test('process charge persiste historico em payment_histories', function () {
    $payment = Payment::factory()->create([
        'status' => PaymentStatus::Pending,
        'settled_at' => null,
    ]);

    app(PaymentService::class)->processCharge($payment);

    expect(PaymentHistory::query()->where('payment_id', $payment->id)->count())->toBe(2);
});

test('payment gateway manager resolve implementacao configurada', function () {
    $gateway = app(PaymentGatewayManager::class)->resolve();

    expect($gateway)->toBeInstanceOf(MockPaymentGateway::class)
        ->and(app(PaymentGatewayManager::class)->driver())->toBe('mock');
});

test('payment gateway manager rejeita driver desconhecido', function () {
    expect(fn () => (new PaymentGatewayManager(
        gateways: config('payment.gateways', []),
        driver: 'inexistente',
    ))->resolve())->toThrow(\InvalidArgumentException::class);
});
