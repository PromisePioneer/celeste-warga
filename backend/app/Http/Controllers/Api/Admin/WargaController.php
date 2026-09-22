<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExportWargaRequest;
use App\Http\Resources\WargaCollection;
use App\Http\Resources\WargaResource;
use App\Models\Warga;
use App\Services\StatistikService;
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
        // Debug: log total count
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
                    $q->whereNotNull('foto_kk')
                      ->orWhereNotNull('foto_ktp')
                      ->orWhereNotNull('foto_keluarga')
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
     * Export warga data
     */
    public function export(ExportWargaRequest $request): StreamedResponse
    {
        $query = Warga::query();

        // Apply same filters as index
        if ($request->has('blok') && $request->input('blok')) {
            $query->where('blok', $request->input('blok'));
        }
        if ($request->has('status_tempat_tinggal') && $request->input('status_tempat_tinggal')) {
            $query->where('status_tempat_tinggal', $request->input('status_tempat_tinggal'));
        }

        $warga = $query->orderBy('blok')->orderBy('unit')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="data-warga-celeste.csv"',
        ];

        return new StreamedResponse(function () use ($warga) {
            $handle = fopen('php://output', 'w');

            // Header
            fputcsv($handle, [
                'No',
                'Nama Lengkap',
                'Blok',
                'Unit',
                'Status Tinggal',
                'Sub Status',
                'Nama',
                'No. HP',
                'Kontrak Mulai',
                'Kontrak Berakhir',
                'Nama Pemilik/PIC',
                'HP Pemilik/PIC',
                'Jenis Usaha',
                'Jumlah Karyawan',
                'Nama Karyawan Menginap',
                'Nama Kepala Keluarga',
                'HP Kepala Keluarga',
                'Nama Istri',
                'Nama Anak',
                'Nama Penghuni Lain',
                'No. HP',
                'Agama',
                'Status Pernikahan',
                'Pekerjaan',
                'Tanggal Input',
            ]);

            // Data
            foreach ($warga as $index => $row) {
                fputcsv($handle, [
                    $index + 1,
                    $row->nama_lengkap,
                    $row->blok,
                    $row->unit,
                    $row->status_tempat_tinggal->label(),
                    $row->sub_status?->label() ?? '-',
                    $row->nama ?? '-',
                    $row->no_hp,
                    $row->mulai_kontrak?->format('d/m/Y') ?? '-',
                    $row->berakhir_kontrak?->format('d/m/Y') ?? '-',
                    $row->nama_pemilik_usaha ?? $row->nama_pic ?? '-',
                    $row->hp_pemilik_usaha ?? $row->hp_pic ?? '-',
                    $row->jenis_usaha ?? '-',
                    $row->jumlah_karyawan ?? 0,
                    $row->nama_karyawan_menginap ?? '-',
                    $row->nama_kepala_keluarga ?? '-',
                    $row->hp_kepala_keluarga ?? '-',
                    $row->nama_istri ?? '-',
                    $row->nama_anak ?? '-',
                    $row->nama_penghuni_lain ?? '-',
                    $row->hp ?? '-',
                    $row->agama->label(),
                    $row->status_pernikahan->label(),
                    $row->pekerjaan ?? '-',
                    $row->created_at->format('d/m/Y H:i'),
                ]);
            }

            fclose($handle);
        }, 200, $headers);
    }

    /**
     * Get warga photo
     */
    public function foto(Warga $warga, string $jenis): Response|StreamedResponse
    {
        $allowedTypes = ['foto_kk', 'foto_ktp', 'foto_keluarga', 'foto_selfie'];

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
