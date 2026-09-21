<?php

namespace App\Http\Controllers\Api;

use App\Actions\StoreWargaAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\CekKtpRequest;
use App\Http\Requests\StoreWargaRequest;
use App\Models\Warga;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

class WargaController extends Controller
{
    /**
     * Check if KTP already exists
     */
    public function cekKtp(CekKtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $hash = hash_hmac('sha256', $validated['no_ktp'], config('app.key'));

        $exists = Warga::withTrashed()->where('no_ktp_hash', $hash)->exists();

        return response()->json([
            'success' => true,
            'terdaftar' => $exists,
        ]);
    }

    /**
     * Store new warga
     */
    public function store(StoreWargaRequest $request, StoreWargaAction $action): JsonResponse
    {
        $validated = $request->validated();

        // Check duplicate one more time
        $hash = hash_hmac('sha256', $validated['no_ktp'], config('app.key'));
        if (Warga::withTrashed()->where('no_ktp_hash', $hash)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No. KTP sudah terdaftar',
                'kode' => 'ktp_sudah_terdaftar',
            ], 422);
        }

        try {
            $warga = $action->execute($validated, $request->ip());

            return response()->json([
                'success' => true,
                'message' => 'Data warga berhasil disimpan',
                'data' => [
                    'id' => $warga->id,
                    'nama' => $warga->nama_lengkap,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error storing warga: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage(),
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
