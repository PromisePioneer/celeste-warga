<?php

use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\WargaController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\WargaController as AdminWargaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

Route::get('/config', [ConfigController::class, 'index']);

// Public storage files
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    if (!file_exists($fullPath)) {
        abort(404);
    }
    return response()->file($fullPath);
})->where('path', '.*');

// Public warga routes with throttle
Route::middleware(['throttle:cek-ktp'])->group(function () {
    Route::post('/warga/cek-ktp', [WargaController::class, 'cekKtp']);
});

Route::middleware(['throttle:warga-submit'])->group(function () {
    Route::post('/warga', [WargaController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Admin API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    // Auth
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum'])->group(function () {
        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Warga management
        Route::get('/warga', [AdminWargaController::class, 'index']);
        Route::get('/warga/export', [AdminWargaController::class, 'export']);
        Route::get('/warga/{warga}', [AdminWargaController::class, 'show']);
        Route::delete('/warga/{warga}', [AdminWargaController::class, 'destroy']);
        Route::get('/warga/{warga}/foto/{jenis}', [AdminWargaController::class, 'foto'])
            ->name('admin.warga.foto');

        // Statistics
        Route::get('/statistik', [AdminWargaController::class, 'statistik']);
    });
});
