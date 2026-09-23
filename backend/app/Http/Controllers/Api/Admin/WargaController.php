<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExportWargaRequest;
use App\Http\Resources\WargaCollection;
use App\Http\Resources\WargaResource;
use App\Models\Warga;
use App\Services\StatistikService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WargaController extends Controller
{
    public function __construct(
        private readonly StatistikService $statistikService
    ) {}

    /**
     * Get paginated list of warga
     */
    public function index(Request $request): JsonResponse
    {
        $totalCount = Warga::count();
        Log::info('Warga index called', ['total' => $totalCount]);

        $query = Warga::query();

        // Search
        if ($request->has('search') && $request->input('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_lengkap', 'like', "%{$search}%")
                  ->orWhere('nama_kepala_keluarga', 'like', "%{$search}%")
                  ->orWhere('no_hp', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->has('blok') && $request->input('blok')) {
            $query->where('blok', $request->input('blok'));
        }

        if ($request->has('unit') && $request->input('unit')) {
            $query->where('unit', $request->input('unit'));
        }

        if ($request->has('status_tempat_tinggal') && $request->input('status_tempat_tinggal')) {
            $query->where('status_tempat_tinggal', $request->input('status_tempat_tinggal'));
        }

        if ($request->has('has_photo')) {
            $hasPhoto = $request->boolean('has_photo');
            if ($hasPhoto) {
                $query->where(function ($q) {
                    $q->whereNotNull('foto_keluarga')
                      ->orWhereNotNull('foto_selfie');
                });
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = min($request->input('per_page', 15), 100);
        $warga = $query->paginate($perPage);

        Log::info('Warga query result', ['count' => $warga->count(), 'total' => $warga->total()]);

        return response()->json([
            'success' => true,
            'data' => new WargaCollection($warga),
            'meta' => [
                'current_page' => $warga->currentPage(),
                'last_page' => $warga->lastPage(),
                'per_page' => $warga->perPage(),
                'total' => $warga->total(),
            ],
        ]);
    }

    /**
     * Get single warga
     */
    public function show(Warga $warga): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new WargaResource($warga),
        ]);
    }

    /**
     * Delete warga (soft delete)
     */
    public function destroy(Warga $warga): JsonResponse
    {
        $warga->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data warga berhasil dihapus',
        ]);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistik(): JsonResponse
    {
        $stats = $this->statistikService->getAll();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Export warga data to PDF
     */
    public function export(ExportWargaRequest $request)
    {
        $query = Warga::query();

        // Apply filters
        if ($request->has('blok') && $request->input('blok')) {
            $query->where('blok', $request->input('blok'));
        }

        if ($request->has('status_tempat_tinggal') && $request->input('status_tempat_tinggal')) {
            $query->where('status_tempat_tinggal', $request->input('status_tempat_tinggal'));
        }

        $warga = $query->orderBy('blok')->orderBy('unit')->get();

        $blok = $request->input('blok');

        $pdf = Pdf::loadView('pdf.warga', [
            'warga' => $warga,
            'total' => $warga->count(),
            'blok' => $blok,
            'tanggal' => now()->format('d F Y'),
            'tanggal_cetak' => now()->format('d/m/Y H:i:s'),
        ]);

        // A4 landscape with proper margins to prevent cutting
        $pdf->setPaper('a4', 'landscape')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => false,
                'defaultFont' => 'dejavusans',
                'marginTop' => 10,
                'marginBottom' => 10,
                'marginLeft' => 5,
                'marginRight' => 5,
            ]);

        $filename = $blok
            ? "data-warga-celeste-blok-{$blok}.pdf"
            : 'data-warga-celeste.pdf';

        return $pdf->stream($filename);
    }

    /**
     * Get warga photo
     */
    public function foto(Warga $warga, string $jenis): Response|StreamedResponse
    {
        $allowedTypes = ['foto_keluarga', 'foto_selfie'];

        if (!in_array($jenis, $allowedTypes)) {
            abort(404);
        }

        if (!$warga->{$jenis}) {
            abort(404);
        }

        $path = $warga->{$jenis};

        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }

        return Storage::disk('private')->response($path);
    }
}
