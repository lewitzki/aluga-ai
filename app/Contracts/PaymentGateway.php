<?php

namespace App\Contracts;

use App\Models\Payment;
use App\Services\Payment\PaymentChargeResult;

interface PaymentGateway
{
    public function charge(Payment $payment): PaymentChargeResult;
}
