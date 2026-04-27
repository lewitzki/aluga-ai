<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $targetRoute = request()->user()?->profile === User::PROFILE_ADMIN
            ? 'admin.dashboard'
            : 'cliente.dashboard';

        return redirect()->route($targetRoute);
    })->name('dashboard');

    Route::inertia('admin/dashboard', 'dashboard')->name('admin.dashboard');
    Route::inertia('cliente/dashboard', 'dashboard')->name('cliente.dashboard');
});

require __DIR__.'/settings.php';
