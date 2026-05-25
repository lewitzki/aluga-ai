<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatus;

readonly class PaymentChargeResult
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public PaymentStatus $status,
        public array $metadata = [],
        public ?string $transactionId = null,
    ) {}
}
