<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limiter for KTP check - more permissive for development
        RateLimiter::for('cek-ktp', function (Request $request) {
            return Limit::perMinutes(1, 60)->by($request->ip());
        });

        // Rate limiter for warga submission - more permissive
        RateLimiter::for('warga-submit', function (Request $request) {
            return Limit::perMinutes(1, 60)->by($request->ip());
        });
    }
}
