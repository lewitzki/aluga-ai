<?php

namespace App\Models;

use App\Enums\RentalStatus;
use Database\Factories\RentalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'tool_id',
    'client_id',
    'starts_at',
    'expected_ends_at',
    'ended_at',
    'status',
    'hourly_rate_snapshot',
    'estimated_total',
    'final_total',
])]
class Rental extends Model
{
    /** @use HasFactory<RentalFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'expected_ends_at' => 'datetime',
            'ended_at' => 'datetime',
            'status' => RentalStatus::class,
            'hourly_rate_snapshot' => 'decimal:2',
            'estimated_total' => 'decimal:2',
            'final_total' => 'decimal:2',
        ];
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }
}
