<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use App\Enums\PaymentStatus;
use App\Models\Payment;

class PaymentService
{
    public function __construct(
        private PaymentGateway $gateway,
    ) {}

    public function processCharge(Payment $payment): Payment
    {
        $payment->histories()->create([
            'status' => PaymentStatus::Pending,
            'metadata' => [
                'gateway' => config('payment.gateway'),
                'phase' => 'initiated',
            ],
        ]);

        $result = $this->gateway->charge($payment);

        $payment->histories()->create([
            'status' => $result->status,
            'metadata' => array_merge($result->metadata, [
                'transaction_id' => $result->transactionId,
                'phase' => 'completed',
            ]),
        ]);

        $payment->update([
            'status' => $result->status,
            'settled_at' => $result->status === PaymentStatus::Approved ? now() : null,
        ]);

        return $payment->fresh(['histories']);
    }
}
