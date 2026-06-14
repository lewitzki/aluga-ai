<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Payment;
use App\Models\Rental;
use App\Models\Tool;
use App\Services\RentalClosureService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ClientDashboardController extends Controller
{
    public function index(RentalClosureService $closure): Response
    {
        $clientId = Auth::id();

        $rentals = Rental::query()
            ->where('client_id', $clientId)
            ->with(['tool:id,name', 'payment'])
            ->orderByDesc('starts_at')
            ->get();

        $activeRentals = $rentals
            ->filter(fn (Rental $rental) => in_array($rental->status, [
                RentalStatus::Scheduled,
                RentalStatus::Active,
                RentalStatus::Late,
            ], true))
            ->values()
            ->map(fn (Rental $rental) => self::serializeRental($rental, $closure));

        $historyRentals = $rentals
            ->filter(fn (Rental $rental) => $rental->status === RentalStatus::Finished)
            ->values()
            ->map(fn (Rental $rental) => self::serializeRental($rental, $closure));

        $totalPaid = Payment::query()
            ->where('status', PaymentStatus::Approved)
            ->whereHas('rental', fn ($query) => $query->where('client_id', $clientId))
            ->sum('amount');

        $toolsCount = Tool::query()
            ->where('owner_id', $clientId)
            ->count();

        return Inertia::render('cliente/dashboard', [
            'summary' => [
                'total_paid' => number_format((float) $totalPaid, 2, '.', ''),
                'currency' => 'BRL',
                'tools_count' => $toolsCount,
            ],
            'active_rentals' => $activeRentals,
            'history_rentals' => $historyRentals,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeRental(Rental $rental, RentalClosureService $closure): array
    {
        return [
            'id' => $rental->id,
            'status' => $rental->status->value,
            'can_close' => $closure->canClose($rental),
            'starts_at' => $rental->starts_at->toIso8601String(),
            'expected_ends_at' => $rental->expected_ends_at->toIso8601String(),
            'ended_at' => $rental->ended_at?->toIso8601String(),
            'hourly_rate_snapshot' => (string) $rental->hourly_rate_snapshot,
            'estimated_total' => $rental->estimated_total !== null
                ? (string) $rental->estimated_total
                : null,
            'final_total' => $rental->final_total !== null
                ? (string) $rental->final_total
                : null,
            'tool' => [
                'id' => $rental->tool->id,
                'name' => $rental->tool->name,
            ],
            'payment' => $rental->payment !== null
                ? [
                    'status' => $rental->payment->status->value,
                    'amount' => (string) $rental->payment->amount,
                ]
                : null,
        ];
    }
}
