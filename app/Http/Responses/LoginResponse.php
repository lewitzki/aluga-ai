<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an authentication response.
     */
    public function toResponse($request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $targetRoute = $user?->profile === User::PROFILE_ADMIN ? 'admin.dashboard' : 'cliente.dashboard';

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false])
            : redirect()->route($targetRoute);
    }
}
