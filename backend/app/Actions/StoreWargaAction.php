<?php

namespace App\Actions;

use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StoreWargaAction
{
    /**
     * Execute the action
     */
    public function execute(array $data, ?string $ip = null): Warga
    {
        // Prepare data
        $wargaData = [
            'blok' => $data['blok'],
            'unit' => $data['unit'],
            'status_tempat_tinggal' => $data['status_tempat_tinggal'],
            'nama_kepala_keluarga' => $data['nama_kepala_keluarga'],
            'nama_lengkap' => $data['nama_lengkap'],
            'no_kk' => $data['no_kk'],
            'no_ktp' => $data['no_ktp'],
            'no_hp' => $data['no_hp'],
            'no_kontak_darurat' => $data['no_kontak_darurat'] ?? null,
            'status_pernikahan' => $data['status_pernikahan'],
            'pekerjaan' => $data['pekerjaan'] ?? null,
            'agama' => $data['agama'],
            'ip_pengisi' => $ip,
        ];

        // Create warga record
        $warga = new Warga($wargaData);
        $warga->save();

        // Process and store photos
        $photoFields = ['foto_kk', 'foto_ktp', 'foto_keluarga', 'foto_selfie'];

        foreach ($photoFields as $field) {
            if (isset($data[$field]) && $data[$field] && $data[$field] instanceof \Illuminate\Http\UploadedFile) {
                $path = $this->storePhoto($data[$field], $warga->id, $field);
                $warga->{$field} = $path;
            }
        }

        $warga->save();

        return $warga;
    }

    /**
     * Store photo file
     */
    private function storePhoto($file, int $wargaId, string $field): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = sprintf('%d_%s_%s.%s', $wargaId, $field, uniqid(), $extension);
        $path = "warga/{$filename}";

        // Store directly to private disk
        Storage::disk('private')->putFileAs('warga', $file, $filename);

        return $path;
    }
}
