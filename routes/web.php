<?php

use App\Http\Controllers\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TeacherController;
use App\Http\Middleware\CheckAccount;
use App\Http\Middleware\CheckTeacherProfile;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::get('/pending', [DashboardController::class, 'pending'])
    ->name('pending');

Route::get('/unauthorized', [DashboardController::class, 'unauthorized'])
    ->name('unauthorized');

Route::middleware(['auth', CheckAccount::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard')
        ->middleware(CheckTeacherProfile::class);

    // * Teacher Routes
    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/create', [TeacherController::class, 'create'])->name('create');
        Route::post('/store', [TeacherController::class, 'store'])->name('store');
        Route::get('/profile', [TeacherController::class, 'profile'])->name('profile');
        Route::get('/edit', [TeacherController::class, 'edit'])->name('edit');
        Route::post('/update', [TeacherController::class, 'update'])->name('update');
    });

    // * Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/teachers', [AdminTeacherController::class, 'index'])->name('teachers.index');
    });
});

require __DIR__.'/settings.php';
