<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminFinanceDashboardController;
use App\Http\Controllers\AdminToolController;
use App\Http\Controllers\AdminToolImageController;
use App\Http\Controllers\ClientDashboardController;
use App\Http\Controllers\ClientRentalClosureController;
use App\Http\Controllers\ClientRentalController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ToolCatalogController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('catalogo', [ToolCatalogController::class, 'index'])->name('catalog.index');
Route::get('catalogo/{tool}', [ToolCatalogController::class, 'show'])->name('catalog.show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $targetRoute = request()->user()?->profile === User::PROFILE_ADMIN
            ? 'admin.dashboard'
            : 'cliente.dashboard';

        return redirect()->route($targetRoute);
    })->name('dashboard');

    Route::middleware(['profile:'.User::PROFILE_ADMIN])->group(function () {
        Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');

        Route::get('admin/financeiro', [AdminFinanceDashboardController::class, 'index'])
            ->name('admin.finance');

        Route::get('admin/ferramentas', [AdminToolController::class, 'index'])->name('admin.tools.index');
        Route::get('admin/ferramentas/criar', [AdminToolController::class, 'create'])->name('admin.tools.create');
        Route::post('admin/ferramentas', [AdminToolController::class, 'store'])->name('admin.tools.store');
        Route::get('admin/ferramentas/{tool}/editar', [AdminToolController::class, 'edit'])->name('admin.tools.edit');
        Route::put('admin/ferramentas/{tool}', [AdminToolController::class, 'update'])->name('admin.tools.update');
        Route::delete('admin/ferramentas/{tool}', [AdminToolController::class, 'destroy'])->name('admin.tools.destroy');
        Route::post('admin/ferramentas/{tool}/imagens', [AdminToolImageController::class, 'store'])->name('admin.tools.images.store');
        Route::delete('admin/ferramentas/{tool}/imagens/{tool_image}', [AdminToolImageController::class, 'destroy'])->name('admin.tools.images.destroy');
    });

    Route::middleware(['profile:'.User::PROFILE_CLIENTE])->group(function () {
        Route::post('catalogo/{tool}/emprestimos', [ClientRentalController::class, 'store'])
            ->name('catalog.rentals.store');
        Route::get('cliente/dashboard', [ClientDashboardController::class, 'index'])
            ->name('cliente.dashboard');
        Route::post('cliente/emprestimos/{rental}/fechar', [ClientRentalClosureController::class, 'store'])
            ->name('cliente.rentals.close');
    });
});

require __DIR__.'/settings.php';
