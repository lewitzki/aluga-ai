<?php

namespace App\Services;

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Validation\ValidationException;

class RentalAvailabilityService
{
    /**
     * Whether two half-open intervals [start, end) overlap.
     */
    public static function periodsOverlap(
        Carbon $requestedStart,
        Carbon $requestedEnd,
        Carbon $existingStart,
        Carbon $existingEnd,
    ): bool {
        return $existingStart->lt($requestedEnd) && $existingEnd->gt($requestedStart);
    }

    public function hasBlockingOverlap(Tool $tool, Carbon $periodStart, Carbon $periodEnd): bool
    {
        return $this->applyOverlapConstraints(
            $tool->rentals()->getQuery(),
            $periodStart,
            $periodEnd,
        )->exists();
    }

    /**
     * @param  Builder<Rental>  $query
     * @return Builder<Rental>
     */
    public function applyOverlapConstraints(
        Builder $query,
        Carbon $periodStart,
        Carbon $periodEnd,
    ): Builder {
        return $query
            ->where('status', '!=', RentalStatus::Finished)
            ->whereRaw(
                'rentals.starts_at < ? AND COALESCE(rentals.ended_at, rentals.expected_ends_at) > ?',
                [$periodEnd, $periodStart]
            );
    }

    public function assertAvailable(Tool $tool, Carbon $periodStart, Carbon $periodEnd): void
    {
        if ($this->hasBlockingOverlap($tool, $periodStart, $periodEnd)) {
            throw ValidationException::withMessages([
                'starts_at' => __('Já existe empréstimo agendado ou ativo que coincide com este período.'),
            ]);
        }
    }
}
