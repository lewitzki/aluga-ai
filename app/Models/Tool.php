<?php

namespace App\Models;

use App\Enums\RentalStatus;
use Database\Factories\ToolFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['user_id', 'name', 'description', 'hourly_rate', 'is_available'])]
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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
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
}
