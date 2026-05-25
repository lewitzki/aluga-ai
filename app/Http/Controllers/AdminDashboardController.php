<?php

namespace App\Http\Controllers;

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'nullable', 'in:todos,scheduled,active,late'],
            'estado_ferramenta' => ['sometimes', 'nullable', 'in:todos,disponivel,emprestada,indisponivel'],
            'q' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $statusFilter = $validated['status'] ?? 'todos';
        $toolStateFilter = $validated['estado_ferramenta'] ?? 'todos';
        $search = mb_strtolower(trim($validated['q'] ?? ''));

        $rentedToolIds = Rental::query()
            ->where('status', '!=', RentalStatus::Finished)
            ->distinct()
            ->pluck('tool_id');

        $tools = Tool::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Tool $tool) => self::serializeTool($tool, $rentedToolIds))
            ->filter(function (array $tool) use ($toolStateFilter, $search) {
                if ($toolStateFilter !== 'todos' && $tool['operational_status'] !== $toolStateFilter) {
                    return false;
                }

                if ($search === '') {
                    return true;
                }

                return str_contains(mb_strtolower($tool['name']), $search);
            })
            ->values();

        $summary = [
            'total' => Tool::query()->count(),
            'available' => Tool::query()
                ->where('is_available', true)
                ->whereNotIn('id', $rentedToolIds)
                ->count(),
            'rented' => $rentedToolIds->count(),
        ];

        $activeRentalsQuery = Rental::query()
            ->with(['tool:id,name', 'client:id,name,email'])
            ->whereIn('status', [
                RentalStatus::Scheduled,
                RentalStatus::Active,
                RentalStatus::Late,
            ])
            ->orderByDesc('starts_at');

        if ($statusFilter !== 'todos') {
            $activeRentalsQuery->where('status', RentalStatus::from($statusFilter));
        }

        if ($search !== '') {
            $activeRentalsQuery->where(function ($query) use ($search) {
                $query->whereHas('tool', fn ($toolQuery) => $toolQuery
                    ->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]))
                    ->orWhereHas('client', fn ($clientQuery) => $clientQuery
                        ->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]));
            });
        }

        $activeRentals = $activeRentalsQuery
            ->get()
            ->map(fn (Rental $rental) => self::serializeActiveRental($rental))
            ->values();

        return Inertia::render('admin/dashboard', [
            'summary' => $summary,
            'tools' => $tools,
            'active_rentals' => $activeRentals,
            'filters' => [
                'status' => $statusFilter,
                'estado_ferramenta' => $toolStateFilter,
                'q' => $validated['q'] ?? '',
            ],
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int|string>  $rentedToolIds
     * @return array<string, mixed>
     */
    private static function serializeTool(Tool $tool, $rentedToolIds): array
    {
        $operationalStatus = self::resolveToolOperationalStatus($tool, $rentedToolIds);

        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'is_available' => $tool->is_available,
            'operational_status' => $operationalStatus,
        ];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int|string>  $rentedToolIds
     */
    private static function resolveToolOperationalStatus(Tool $tool, $rentedToolIds): string
    {
        if ($rentedToolIds->contains($tool->id)) {
            return 'emprestada';
        }

        if (! $tool->is_available) {
            return 'indisponivel';
        }

        return 'disponivel';
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeActiveRental(Rental $rental): array
    {
        return [
            'id' => $rental->id,
            'status' => $rental->status->value,
            'starts_at' => $rental->starts_at->toIso8601String(),
            'expected_ends_at' => $rental->expected_ends_at->toIso8601String(),
            'tool' => [
                'id' => $rental->tool->id,
                'name' => $rental->tool->name,
            ],
            'client' => [
                'id' => $rental->client->id,
                'name' => $rental->client->name,
                'email' => $rental->client->email,
            ],
        ];
    }
}
