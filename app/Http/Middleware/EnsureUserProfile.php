<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserProfile
{
    /**
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $profile): Response
    {
        if ($request->user()?->profile !== $profile) {
            abort(403);
        }

        return $next($request);
    }
}
