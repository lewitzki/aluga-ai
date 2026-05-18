<?php

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\User;
use App\Services\RentalAvailabilityService;
use Carbon\Carbon;

test('empréstimo finalizado não bloqueia novo período sobreposto', function () {
    $tool = Tool::factory()->create(['is_available' => true]);
    $cliente = User::factory()->cliente()->create();

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Finished,
    ]);

    $service = app(RentalAvailabilityService::class);

    expect($service->hasBlockingOverlap(
        $tool,
        Carbon::parse('2031-06-03 10:00:00'),
        Carbon::parse('2031-06-05 10:00:00'),
    ))->toBeFalse();
});

test('empréstimo agendado bloqueia período sobreposto', function () {
    $tool = Tool::factory()->create(['is_available' => true]);
    $cliente = User::factory()->cliente()->create();

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'status' => RentalStatus::Scheduled,
    ]);

    $service = app(RentalAvailabilityService::class);

    expect($service->hasBlockingOverlap(
        $tool,
        Carbon::parse('2031-06-03 10:00:00'),
        Carbon::parse('2031-06-05 10:00:00'),
    ))->toBeTrue();
});

test('empréstimo encerrado antecipadamente libera período após ended_at', function () {
    $tool = Tool::factory()->create(['is_available' => true]);
    $cliente = User::factory()->cliente()->create();

    Rental::factory()->create([
        'tool_id' => $tool->id,
        'client_id' => $cliente->id,
        'starts_at' => '2031-06-01 10:00:00',
        'expected_ends_at' => '2031-06-07 18:00:00',
        'ended_at' => '2031-06-05 12:00:00',
        'status' => RentalStatus::Active,
    ]);

    $service = app(RentalAvailabilityService::class);

    expect($service->hasBlockingOverlap(
        $tool,
        Carbon::parse('2031-06-05 12:00:00'),
        Carbon::parse('2031-06-07 18:00:00'),
    ))->toBeFalse();
});
