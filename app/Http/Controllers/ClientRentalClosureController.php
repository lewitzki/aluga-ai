<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Services\RentalClosureService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class ClientRentalClosureController extends Controller
{
    public function store(
        Request $request,
        Rental $rental,
        RentalClosureService $closure,
    ): RedirectResponse {
        if ($rental->client_id !== $request->user()->id) {
            abort(403);
        }

        try {
            $closed = $closure->close($rental);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'rental' => $exception->getMessage(),
            ]);
        }

        $message = $closed->status->value === 'late'
            ? __('Empréstimo encerrado com atraso. Valor final: R$ :amount.', [
                'amount' => number_format((float) $closed->final_total, 2, ',', '.'),
            ])
            : __('Empréstimo encerrado. Valor final: R$ :amount.', [
                'amount' => number_format((float) $closed->final_total, 2, ',', '.'),
            ]);

        return redirect()
            ->route('cliente.dashboard')
            ->with('success', $message);
    }
}
