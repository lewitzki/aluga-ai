<?php

use App\Services\Payment\MockPaymentGateway;

return [

    /*
    |--------------------------------------------------------------------------
    | Payment gateway driver
    |--------------------------------------------------------------------------
    |
    | Identifies which gateway implementation is bound to PaymentGateway.
    | Use "mock" for the MVP simulated processor.
    |
    */

    'gateway' => env('PAYMENT_GATEWAY', 'mock'),

    'gateways' => [
        'mock' => MockPaymentGateway::class,
    ],

    'mock' => [

        /*
        | Default simulated outcome: approved, failed or pending.
        | Override in tests via Config::set('payment.mock.default_status', ...).
        */
        'default_status' => env('PAYMENT_MOCK_DEFAULT_STATUS', 'approved'),

    ],

];
