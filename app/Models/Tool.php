<?php

namespace App\Models;

use App\Enums\RentalStatus;
use App\Services\RentalAvailabilityService;
use Carbon\Carbon;
use Database\Factories\ToolFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['owner_id', 'name', 'description', 'hourly_rate', 'is_available'])]
class Tool extends Model
{
    /** @use HasFactory<ToolFactory> */
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'hourly_rate' => 'decimal:2',
            'is_available' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * @return HasMany<ToolImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ToolImage::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<Rental, $this>
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    public function hasNonFinishedRentals(): bool
    {
        return $this->rentals()
            ->where('status', '!=', RentalStatus::Finished)
            ->exists();
    }

    /**
     * Whether a non-finished rental intersects [periodStart, periodEnd).
     */
    public function hasOverlappingRentalPeriod(Carbon $periodStart, Carbon $periodEnd): bool
    {
        return app(RentalAvailabilityService::class)
            ->hasBlockingOverlap($this, $periodStart, $periodEnd);
    }
}
