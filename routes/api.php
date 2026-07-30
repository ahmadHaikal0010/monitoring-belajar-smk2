<?php

use App\Http\Controllers\Api\Authentication;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnrollmentController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\StudentProgressController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [Authentication::class, 'login']);
Route::post('/register', [Authentication::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [StudentController::class, 'profile']);
    Route::post('/update-profile', [StudentController::class, 'update']);

    // Dashboard Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/summary', [DashboardController::class, 'summary']);
        Route::get('/enrolled-subjects', [DashboardController::class, 'enrolledSubjects']);
        Route::get('/recent-activities', [DashboardController::class, 'recentActivities']);
    });

    // Enrollment Routes
    Route::get('/subjects', [EnrollmentController::class, 'index']);
    Route::post('/enroll', [EnrollmentController::class, 'store']);

    // Material Routes
    Route::get('/subjects/{subject}/materials', [MaterialController::class, 'index']);
    Route::get('/materials/{material}', [MaterialController::class, 'show']);

    // Progress Routes
    Route::post('/materials/{material}/complete', [StudentProgressController::class, 'markAsCompleted']);
    Route::get('/subjects/{subject}/progress', [StudentProgressController::class, 'getSubjectProgress']);

    // Exam Routes (Mobile Client Siswa)
    Route::get('/subjects/{subject}/exams', [ExamController::class, 'index']);
    Route::post('/exams/{exam}/start', [ExamController::class, 'start']);
    Route::get('/exams/sessions/{session}', [ExamController::class, 'showSession']);
    Route::post('/exams/sessions/{session}/answer', [ExamController::class, 'submitAnswer']);
    Route::post('/exams/sessions/{session}/answers', [ExamController::class, 'submitMultipleAnswers']);
    Route::post('/exams/sessions/{session}/submit', [ExamController::class, 'submitSession']);
    Route::get('/exams/sessions/{session}/result', [ExamController::class, 'result']);

    Route::post('/logout', [Authentication::class, 'logout']);

});
