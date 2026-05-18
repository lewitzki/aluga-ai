<?php

use App\Services\RentalAvailabilityService;
use Carbon\Carbon;

test('intervalos adjacentes não se sobrepõem', function () {
    $existingStart = Carbon::parse('2031-06-01 10:00:00');
    $existingEnd = Carbon::parse('2031-06-07 18:00:00');
    $requestedStart = Carbon::parse('2031-06-07 18:00:00');
    $requestedEnd = Carbon::parse('2031-06-10 10:00:00');

    expect(RentalAvailabilityService::periodsOverlap(
        $requestedStart,
        $requestedEnd,
        $existingStart,
        $existingEnd,
    ))->toBeFalse();
});

test('mesmo instante de início e fim entre períodos adjacentes não gera conflito', function () {
    $boundary = Carbon::parse('2031-06-07 18:00:00');

    expect(RentalAvailabilityService::periodsOverlap(
        $boundary,
        Carbon::parse('2031-06-10 10:00:00'),
        Carbon::parse('2031-06-01 10:00:00'),
        $boundary,
    ))->toBeFalse();
});

test('períodos idênticos se sobrepõem', function () {
    $start = Carbon::parse('2031-06-01 10:00:00');
    $end = Carbon::parse('2031-06-07 18:00:00');

    expect(RentalAvailabilityService::periodsOverlap($start, $end, $start, $end))->toBeTrue();
});

test('período contido dentro de outro se sobrepõe', function () {
    expect(RentalAvailabilityService::periodsOverlap(
        Carbon::parse('2031-06-03 10:00:00'),
        Carbon::parse('2031-06-05 10:00:00'),
        Carbon::parse('2031-06-01 10:00:00'),
        Carbon::parse('2031-06-07 18:00:00'),
    ))->toBeTrue();
});
