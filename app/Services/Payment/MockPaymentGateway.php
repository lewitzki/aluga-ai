<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGateway;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Support\Str;

class MockPaymentGateway implements PaymentGateway
{
    public function charge(Payment $payment): PaymentChargeResult
    {
        $status = PaymentStatus::from(
            (string) config('payment.mock.default_status', PaymentStatus::Approved->value),
        );

        return new PaymentChargeResult(
            status: $status,
            metadata: [
                'gateway' => 'mock',
                'amount' => (string) $payment->amount,
                'currency' => $payment->currency,
                'simulated_at' => now()->toIso8601String(),
            ],
            transactionId: 'mock_'.Str::lower(Str::ulid()),
        );
    }
}
