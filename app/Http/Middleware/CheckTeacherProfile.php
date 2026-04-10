<?php

namespace App\Http\Middleware;

use App\Services\TeacherService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTeacherProfile
{
    protected $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->user()->id;

        if (! $this->teacherService->isProfileCompleted($userId)) {
            return redirect()->route('teacher.create');
        }

        return $next($request);
    }
}
