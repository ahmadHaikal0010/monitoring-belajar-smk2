<?php

use App\Http\Controllers\Api\Authentication;
use App\Http\Controllers\Api\StudentController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [Authentication::class, 'login']);
Route::post('/register', [Authentication::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [StudentController::class, 'profile']);
    Route::post('/update-profile', [StudentController::class, 'update']);
    Route::post('/logout', [Authentication::class, 'logout']);
});
