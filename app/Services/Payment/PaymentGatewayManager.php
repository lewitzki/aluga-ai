<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGateway;
use InvalidArgumentException;

class PaymentGatewayManager
{
    /**
     * @param  array<string, class-string<PaymentGateway>>  $gateways
     */
    public function __construct(
        private array $gateways,
        private string $driver,
    ) {}

    public function driver(): string
    {
        return $this->driver;
    }

    public function resolve(?string $driver = null): PaymentGateway
    {
        $driver ??= $this->driver;

        if (! isset($this->gateways[$driver])) {
            throw new InvalidArgumentException(
                "Payment gateway [{$driver}] is not configured.",
            );
        }

        return app($this->gateways[$driver]);
    }
}
