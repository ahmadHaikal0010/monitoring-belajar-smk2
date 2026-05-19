<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jadwal reset semester: Berjalan setiap 6 bulan (1 Januari & 1 Juli) pukul 00:00
Schedule::command('app:reset-semester --force')->twiceYearly(1, 1);
