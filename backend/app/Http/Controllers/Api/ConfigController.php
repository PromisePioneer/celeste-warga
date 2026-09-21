<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warga;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class ConfigController extends Controller
{
    /**
     * Get Celeste configuration
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'blok' => config('celeste.blok'),
                'status_tempat_tinggal' => config('celeste.status_tempat_tinggal'),
                'agama' => config('celeste.agama'),
                'status_pernikahan' => config('celeste.status_pernikahan'),
            ],
        ]);
    }
}
