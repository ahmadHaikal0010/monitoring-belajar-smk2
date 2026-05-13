<?php

use App\Http\Controllers\Api\Authentication;
use Illuminate\Support\Facades\Route;

Route::post('/login', [Authentication::class, 'login']);
Route::post('/register', [Authentication::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [Authentication::class, 'logout']);
});
