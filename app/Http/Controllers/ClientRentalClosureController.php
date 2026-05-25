<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
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

        $amount = number_format((float) $closed->final_total, 2, ',', '.');
        $closureMessage = $closed->status->value === 'late'
            ? __('Empréstimo encerrado com atraso. Valor final: R$ :amount.', ['amount' => $amount])
            : __('Empréstimo encerrado. Valor final: R$ :amount.', ['amount' => $amount]);

        $paymentStatus = $closed->payment?->status;
        $message = match ($paymentStatus) {
            PaymentStatus::Approved => $closureMessage.' '.__('Pagamento aprovado.'),
            PaymentStatus::Failed => $closureMessage.' '.__('Pagamento recusado. Tente novamente mais tarde.'),
            PaymentStatus::Pending => $closureMessage.' '.__('Pagamento pendente de confirmação.'),
            default => $closureMessage,
        };

        return redirect()
            ->route('cliente.dashboard')
            ->with('success', $message);
    }
}
