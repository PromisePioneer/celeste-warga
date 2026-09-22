<?php

namespace App\Services;

use App\Models\Warga;
use App\Enums\StatusTempatTinggal;
use App\Enums\SubStatusKontrak;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatistikService
{
    /**
     * Get all statistics
     */
    public function getAll(): array
    {
        return [
            'total_warga' => $this->getTotalWarga(),
            'warga_per_status' => $this->getWargaPerStatus(),
            'warga_per_sub_status' => $this->getWargaPerSubStatus(),
            'warga_per_blok' => $this->getWargaPerBlok(),
            'warga_per_agama' => $this->getWargaPerAgama(),
            'warga_per_status_pernikahan' => $this->getWargaPerStatusPernikahan(),
            'warga_dengan_foto' => $this->getWargaDenganFoto(),
            'pengisian_hari_ini' => $this->getPengisianHariIni(),
            'tren_pengisian' => $this->getTrenPengisian(),
        ];
    }

    /**
     * Get total warga count
     */
    private function getTotalWarga(): int
    {
        return Warga::count();
    }

    /**
     * Get warga count per status tempat tinggal
     */
    private function getWargaPerStatus(): array
    {
        $statuses = StatusTempatTinggal::cases();

        $result = [];
        foreach ($statuses as $status) {
            $result[] = [
                'label' => $status->label(),
                'value' => $status->value,
                'count' => Warga::where('status_tempat_tinggal', $status->value)->count(),
            ];
        }

        return $result;
    }

    /**
     * Get warga count per sub status (kontrak type)
     */
    private function getWargaPerSubStatus(): array
    {
        $subStatuses = SubStatusKontrak::cases();

        $result = [];
        foreach ($subStatuses as $status) {
            $result[] = [
                'label' => $status->label(),
                'value' => $status->value,
                'count' => Warga::where('sub_status', $status->value)->count(),
            ];
        }

        return $result;
    }

    /**
     * Get warga count per blok
     */
    private function getWargaPerBlok(): array
    {
        return Warga::select('blok', DB::raw('COUNT(*) as count'))
            ->groupBy('blok')
            ->orderBy('blok')
            ->get()
            ->map(fn($item) => [
                'blok' => $item->blok,
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get warga count per agama
     */
    private function getWargaPerAgama(): array
    {
        return DB::table('warga')
            ->select('agama', DB::raw('COUNT(*) as count'))
            ->groupBy('agama')
            ->get()
            ->map(fn($item) => [
                'label' => ucfirst($item->agama),
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get warga count per status pernikahan
     */
    private function getWargaPerStatusPernikahan(): array
    {
        return DB::table('warga')
            ->select('status_pernikahan', DB::raw('COUNT(*) as count'))
            ->groupBy('status_pernikahan')
            ->get()
            ->map(fn($item) => [
                'label' => ucwords(str_replace('_', ' ', $item->status_pernikahan)),
                'count' => $item->count,
            ])
            ->toArray();
    }

    /**
     * Get count of warga with at least one photo
     */
    private function getWargaDenganFoto(): int
    {
        return Warga::whereNotNull('foto_kk')
            ->orWhereNotNull('foto_ktp')
            ->orWhereNotNull('foto_keluarga')
            ->orWhereNotNull('foto_selfie')
            ->count();
    }

    /**
     * Get warga count for today
     */
    private function getPengisianHariIni(): int
    {
        return Warga::whereDate('created_at', Carbon::today())->count();
    }

    /**
     * Get filling trend for last 30 days
     */
    private function getTrenPengisian(): array
    {
        $startDate = Carbon::now()->subDays(29)->startOfDay();

        $data = DB::table('warga')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        // Fill in missing dates with zero
        $result = [];
        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays(29 - $i)->format('Y-m-d');
            $count = $data->firstWhere('date', $date)?->count ?? 0;
            $result[] = [
                'date' => $date,
                'count' => $count,
            ];
        }

        return $result;
    }
}
