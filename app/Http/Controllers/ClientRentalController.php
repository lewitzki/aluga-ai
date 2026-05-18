<?php

namespace App\Http\Controllers;

use App\Enums\RentalStatus;
use App\Models\Rental;
use App\Models\Tool;
use App\Services\RentalAvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ClientRentalController extends Controller
{
    public function store(
        Request $request,
        Tool $tool,
        RentalAvailabilityService $availability,
    ): RedirectResponse {
        $validated = $request->validate([
            'starts_at' => ['required', 'date'],
            'expected_ends_at' => ['required', 'date', 'after:starts_at'],
        ]);

        if (! $tool->is_available) {
            throw ValidationException::withMessages([
                'starts_at' => __('Esta ferramenta não está disponível para empréstimo.'),
            ]);
        }

        $startsAt = Carbon::parse($validated['starts_at']);
        $expectedEndsAt = Carbon::parse($validated['expected_ends_at']);

        $availability->assertAvailable($tool, $startsAt, $expectedEndsAt);

        $minutes = $startsAt->diffInMinutes($expectedEndsAt);
        $hours = max($minutes / 60, 1 / 60);
        $hourly = (float) $tool->hourly_rate;
        $estimatedTotal = round($hours * $hourly, 2);

        Rental::query()->create([
            'tool_id' => $tool->id,
            'client_id' => $request->user()->id,
            'starts_at' => $startsAt,
            'expected_ends_at' => $expectedEndsAt,
            'ended_at' => null,
            'status' => RentalStatus::Scheduled,
            'hourly_rate_snapshot' => $tool->hourly_rate,
            'estimated_total' => $estimatedTotal,
            'final_total' => null,
        ]);

        return redirect()
            ->route('cliente.dashboard')
            ->with('success', __('Solicitação de empréstimo registrada.'));
    }
}
