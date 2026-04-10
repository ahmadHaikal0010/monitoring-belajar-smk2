<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAccount
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Jika rute saat ini adalah pending atau unauthorized, jangan dialihkan lagi
        if ($request->routeIs('pending') || $request->routeIs('unauthorized')) {
            return $next($request);
        }

        if ($user && $user->role === 'siswa') {
            return redirect()->route('unauthorized');
        }

        if ($user && ! $user->is_approved) {
            return redirect()->route('pending');
        }

        return $next($request);
    }
}
