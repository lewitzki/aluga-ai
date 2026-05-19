<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\RentalStatus;
use App\Models\Payment;
use App\Models\Rental;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RentalClosureService
{
    public function canClose(Rental $rental): bool
    {
        return $rental->ended_at === null
            && $rental->status !== RentalStatus::Finished;
    }

    public function calculateBillableHours(CarbonInterface $startsAt, CarbonInterface $endedAt): float
    {
        if ($endedAt->lte($startsAt)) {
            return 0.0;
        }

        $minutes = $startsAt->diffInMinutes($endedAt);

        return max($minutes / 60, 1 / 60);
    }

    public function calculateFinalTotal(Rental $rental, CarbonInterface $endedAt): string
    {
        $hours = $this->calculateBillableHours($rental->starts_at, $endedAt);
        $total = round($hours * (float) $rental->hourly_rate_snapshot, 2);

        return number_format($total, 2, '.', '');
    }

    public function resolveClosingStatus(Rental $rental, CarbonInterface $endedAt): RentalStatus
    {
        return $endedAt->gt($rental->expected_ends_at)
            ? RentalStatus::Late
            : RentalStatus::Finished;
    }

    /**
     * @return array{
     *     rental: Rental,
     *     final_total: string,
     *     status: RentalStatus,
     *     billable_hours: float,
     * }
     */
    public function preview(Rental $rental, ?CarbonInterface $endedAt = null): array
    {
        $endedAt ??= Carbon::now();
        $billableHours = $this->calculateBillableHours($rental->starts_at, $endedAt);

        return [
            'rental' => $rental,
            'final_total' => $this->calculateFinalTotal($rental, $endedAt),
            'status' => $this->resolveClosingStatus($rental, $endedAt),
            'billable_hours' => $billableHours,
        ];
    }

    public function close(Rental $rental, ?CarbonInterface $endedAt = null): Rental
    {
        if (! $this->canClose($rental)) {
            throw new InvalidArgumentException(__('Este empréstimo já foi encerrado.'));
        }

        $endedAt ??= Carbon::now();
        $preview = $this->preview($rental, $endedAt);

        return DB::transaction(function () use ($rental, $endedAt, $preview) {
            $rental->update([
                'ended_at' => $endedAt,
                'status' => $preview['status'],
                'final_total' => $preview['final_total'],
            ]);

            Payment::query()->updateOrCreate(
                ['rental_id' => $rental->id],
                [
                    'amount' => $preview['final_total'],
                    'currency' => 'BRL',
                    'status' => PaymentStatus::Pending,
                    'settled_at' => null,
                ],
            );

            return $rental->fresh(['payment']);
        });
    }
}
