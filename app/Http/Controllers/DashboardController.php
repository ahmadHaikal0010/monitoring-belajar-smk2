<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard');
    }

    public function pending()
    {
        return Inertia::render('pending');
    }

    public function unauthorized()
    {
        return Inertia::render('unauthorized');
    }
}
