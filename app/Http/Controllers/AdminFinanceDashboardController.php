<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminFinanceDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'nullable', 'in:todos,approved,failed,pending'],
            'from' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'to' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ]);

        $statusFilter = $validated['status'] ?? 'todos';
        $from = isset($validated['from']) ? Carbon::parse($validated['from'])->startOfDay() : null;
        $to = isset($validated['to']) ? Carbon::parse($validated['to'])->endOfDay() : null;

        if ($from !== null && $to !== null && $from->gt($to)) {
            throw ValidationException::withMessages([
                'to' => 'A data final deve ser igual ou posterior à data inicial.',
            ]);
        }

        $filteredQuery = self::applyFilters(
            Payment::query(),
            $statusFilter,
            $from,
            $to,
        );

        $totalApproved = (clone $filteredQuery)
            ->where('status', PaymentStatus::Approved)
            ->sum('amount');

        $statusCounts = (clone $filteredQuery)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $periodRevenue = (clone $filteredQuery)
            ->where('status', PaymentStatus::Approved)
            ->get()
            ->groupBy(fn (Payment $payment) => self::resolvePaymentMoment($payment)->format('Y-m'))
            ->map(fn ($group, string $period) => [
                'period' => $period,
                'total' => number_format((float) $group->sum('amount'), 2, '.', ''),
                'count' => $group->count(),
            ])
            ->sortKeysDesc()
            ->values();

        $payments = self::applyFilters(
            Payment::query()->with(['rental.tool:id,name', 'rental.client:id,name,email']),
            $statusFilter,
            $from,
            $to,
        )
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Payment $payment) => self::serializePayment($payment));

        return Inertia::render('admin/finance', [
            'summary' => [
                'total_approved' => number_format((float) $totalApproved, 2, '.', ''),
                'currency' => 'BRL',
                'approved_count' => (int) ($statusCounts[PaymentStatus::Approved->value] ?? 0),
                'pending_count' => (int) ($statusCounts[PaymentStatus::Pending->value] ?? 0),
                'failed_count' => (int) ($statusCounts[PaymentStatus::Failed->value] ?? 0),
            ],
            'period_revenue' => $periodRevenue,
            'payments' => $payments,
            'filters' => [
                'status' => $statusFilter,
                'from' => $validated['from'] ?? '',
                'to' => $validated['to'] ?? '',
            ],
        ]);
    }

    /**
     * @param  Builder<Payment>  $query
     * @return Builder<Payment>
     */
    private static function applyFilters(
        Builder $query,
        string $statusFilter,
        ?Carbon $from,
        ?Carbon $to,
    ): Builder {
        if ($statusFilter !== 'todos') {
            $query->where('status', PaymentStatus::from($statusFilter));
        }

        if ($from !== null) {
            $query->where(function (Builder $dateQuery) use ($from) {
                $dateQuery
                    ->where('settled_at', '>=', $from)
                    ->orWhere(function (Builder $fallbackQuery) use ($from) {
                        $fallbackQuery
                            ->whereNull('settled_at')
                            ->where('created_at', '>=', $from);
                    });
            });
        }

        if ($to !== null) {
            $query->where(function (Builder $dateQuery) use ($to) {
                $dateQuery
                    ->where('settled_at', '<=', $to)
                    ->orWhere(function (Builder $fallbackQuery) use ($to) {
                        $fallbackQuery
                            ->whereNull('settled_at')
                            ->where('created_at', '<=', $to);
                    });
            });
        }

        return $query;
    }

    private static function resolvePaymentMoment(Payment $payment): CarbonInterface
    {
        return $payment->settled_at ?? $payment->created_at;
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializePayment(Payment $payment): array
    {
        return [
            'id' => $payment->id,
            'status' => $payment->status->value,
            'amount' => (string) $payment->amount,
            'currency' => $payment->currency,
            'settled_at' => $payment->settled_at?->toIso8601String(),
            'created_at' => $payment->created_at->toIso8601String(),
            'rental' => [
                'id' => $payment->rental->id,
                'status' => $payment->rental->status->value,
            ],
            'tool' => [
                'id' => $payment->rental->tool->id,
                'name' => $payment->rental->tool->name,
            ],
            'client' => [
                'id' => $payment->rental->client->id,
                'name' => $payment->rental->client->name,
                'email' => $payment->rental->client->email,
            ],
        ];
    }
}
