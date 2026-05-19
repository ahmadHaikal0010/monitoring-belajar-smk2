<?php

use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherController;
use App\Http\Middleware\AdminAccess;
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

// * Authenticated Routes
Route::middleware(['auth', CheckAccount::class])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard')
        ->middleware(CheckTeacherProfile::class);

    // * Teacher Routes
    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/create', [TeacherController::class, 'create'])->name('create');
        Route::post('/store', [TeacherController::class, 'store'])->name('store');

        Route::middleware(CheckTeacherProfile::class)->group(function () {
            Route::get('/profile', [TeacherController::class, 'profile'])->name('profile');
            Route::get('/edit', [TeacherController::class, 'edit'])->name('edit');
            Route::put('/update/{teacher}', [TeacherController::class, 'update'])->name('update');

            Route::resource('subjects', SubjectController::class);
            Route::resource('materials', MaterialController::class);
        });

    });

    // * Shared Admin/Guru Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
        Route::delete('/enrollments/{id}', [EnrollmentController::class, 'destroy'])->name('enrollments.destroy');
    });

    // * Admin ONLY Routes
    Route::prefix('admin')->name('admin.')->middleware(AdminAccess::class)->group(function () {
        Route::resource('teachers', AdminTeacherController::class);
        Route::resource('users', AdminUserController::class);
        Route::resource('students', AdminStudentController::class);
        Route::get('/approval', [AdminUserController::class, 'approval'])->name('users.approval');
        Route::put('/users/{id}/approve', [AdminUserController::class, 'approve'])->name('users.approve');
    });
});

require __DIR__.'/settings.php';
