<?php

use App\Http\Controllers\Admin\ClassEnrollmentController as AdminClassEnrollmentController;
use App\Http\Controllers\Admin\ClassroomController as AdminClassroomController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\MajorController as AdminMajorController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\ClassroomContentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\ReportExportController;
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
            Route::match(['put', 'post'], '/update/{teacher}', [TeacherController::class, 'update'])->name('update');

            Route::resource('subjects', SubjectController::class);
            Route::post('subjects/{subject}/classrooms', [SubjectController::class, 'syncClassrooms'])->name('subjects.classrooms.sync');

            // Classroom Content Management Routes (Materials, Assignments, Exams per Class)
            Route::get('subjects/{subject}/classrooms/{classroom}/materials', [ClassroomContentController::class, 'materials'])->name('subjects.classrooms.materials');
            Route::post('subjects/{subject}/classrooms/{classroom}/materials/copy', [ClassroomContentController::class, 'copyMaterials'])->name('subjects.classrooms.materials.copy');
            Route::get('subjects/{subject}/classrooms/{classroom}/assignments', [ClassroomContentController::class, 'assignments'])->name('subjects.classrooms.assignments');
            Route::post('subjects/{subject}/classrooms/{classroom}/assignments/copy', [ClassroomContentController::class, 'copyAssignments'])->name('subjects.classrooms.assignments.copy');
            Route::get('subjects/{subject}/classrooms/{classroom}/exams', [ClassroomContentController::class, 'exams'])->name('subjects.classrooms.exams');
            Route::post('subjects/{subject}/classrooms/{classroom}/exams/copy', [ClassroomContentController::class, 'copyExams'])->name('subjects.classrooms.exams.copy');
            Route::get('subjects/{subject}/classrooms/{classroom}/progress', [ClassroomContentController::class, 'progress'])->name('subjects.classrooms.progress');
            Route::resource('materials', MaterialController::class);
            Route::resource('exams', ExamController::class);
            Route::patch('exams/{exam}/publish', [ExamController::class, 'publish'])->name('exams.publish');
            Route::patch('exams/{exam}/unpublish', [ExamController::class, 'unpublish'])->name('exams.unpublish');
            Route::post('exams/{exam}/questions', [ExamController::class, 'storeQuestion'])->name('exams.questions.store');
            Route::post('exams/{exam}/questions/{question}', [ExamController::class, 'updateQuestion'])->name('exams.questions.update');
            Route::delete('exams/{exam}/questions/{question}', [ExamController::class, 'destroyQuestion'])->name('exams.questions.destroy');

            Route::resource('assignments', AssignmentController::class);
            Route::get('assignments/{assignment}/submissions/{submission}', [AssignmentController::class, 'showSubmission'])->name('assignments.submissions.show');
            Route::post('assignments/{assignment}/submissions/{submission}/grade', [AssignmentController::class, 'gradeSubmission'])->name('assignments.submissions.grade');
        });

    });

    // * Shared Admin/Guru Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/enrollments', [EnrollmentController::class, 'index'])->name('enrollments.index');
        Route::get('/enrollments/{id}/progress', [EnrollmentController::class, 'progress'])->name('enrollments.progress');
        Route::delete('/enrollments/{id}', [EnrollmentController::class, 'destroy'])->name('enrollments.destroy');
        Route::get('/subjects/{subject}/export', [ReportExportController::class, 'export'])->name('subjects.export');
        Route::get('/subjects/{subject}/export-options', [ReportExportController::class, 'getExportOptions'])->name('subjects.export-options');
    });

    // * Admin ONLY Routes
    Route::prefix('admin')->name('admin.')->middleware(AdminAccess::class)->group(function () {
        Route::post('teachers/import', [AdminTeacherController::class, 'import'])->name('teachers.import');
        Route::get('teachers/import-template', [AdminTeacherController::class, 'downloadTemplate'])->name('teachers.import-template');
        Route::resource('teachers', AdminTeacherController::class);
        Route::resource('users', AdminUserController::class);
        Route::resource('students', AdminStudentController::class);
        Route::resource('majors', AdminMajorController::class);
        Route::resource('classrooms', AdminClassroomController::class);
        Route::get('classrooms/{classroom}/students', [AdminClassEnrollmentController::class, 'index'])->name('classrooms.students.index');
        Route::post('classrooms/{classroom}/students', [AdminClassEnrollmentController::class, 'store'])->name('classrooms.students.store');
        Route::put('classrooms/{classroom}/students/{student}', [AdminClassEnrollmentController::class, 'updateStatus'])->name('classrooms.students.update-status');
        Route::delete('classrooms/{classroom}/students/{student}', [AdminClassEnrollmentController::class, 'destroy'])->name('classrooms.students.destroy');
        Route::get('/approval', [AdminUserController::class, 'approval'])->name('users.approval');
        Route::put('/users/{id}/approve', [AdminUserController::class, 'approve'])->name('users.approve');
    });
});

require __DIR__.'/settings.php';
