<?php

namespace App\Providers;

use App\Repositories\Interfaces\EnrollmentRepositoryInterface;
use App\Repositories\Interfaces\MaterialRepositoryInterface;
use App\Repositories\Interfaces\StudentRepositoryInterface;
use App\Repositories\Interfaces\SubjectRepositoryInterface;
use App\Repositories\Interfaces\TeacherRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use App\Repositories\SqlEnrollmentRepository;
use App\Repositories\SqlMaterialRepository;
use App\Repositories\SqlStudentRepository;
use App\Repositories\SqlSubjectRepository;
use App\Repositories\SqlTeacherRepository;
use App\Repositories\SqlUserRepository;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            TeacherRepositoryInterface::class,
            SqlTeacherRepository::class
        );

        $this->app->bind(
            UserRepositoryInterface::class,
            SqlUserRepository::class
        );

        $this->app->bind(
            SubjectRepositoryInterface::class,
            SqlSubjectRepository::class
        );

        $this->app->bind(
            MaterialRepositoryInterface::class,
            SqlMaterialRepository::class
        );

        $this->app->bind(
            StudentRepositoryInterface::class,
            SqlStudentRepository::class
        );

        $this->app->bind(
            EnrollmentRepositoryInterface::class,
            SqlEnrollmentRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
