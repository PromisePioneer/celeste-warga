<?php

namespace App\Actions;

use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class StoreWargaAction
{
    /**
     * Execute the action
     */
    public function execute(array $data, ?string $ip = null): Warga
    {
        // Debug: log photo fields
        $photoFields = ['foto_kk', 'foto_ktp', 'foto_keluarga', 'foto_selfie'];
        foreach ($photoFields as $field) {
            if (isset($data[$field])) {
                Log::info("Photo field {$field}: " . gettype($data[$field]));
                if ($data[$field] instanceof \Illuminate\Http\UploadedFile) {
                    Log::info("  -> File name: " . $data[$field]->getClientOriginalName());
                    Log::info("  -> File size: " . $data[$field]->getSize());
                }
            }
        }

        // Prepare data
        $wargaData = [
            'blok' => $data['blok'],
            'unit' => $data['unit'],
            'status_tempat_tinggal' => $data['status_tempat_tinggal'],
            'sub_status' => $data['sub_status'] ?? null,

            // Milik Sendiri & Kontrak Keluarga
            'nama_kepala_keluarga' => $data['nama_kepala_keluarga'] ?? null,
            'hp_kepala_keluarga' => $data['hp_kepala_keluarga'] ?? null,
            'nama_istri' => $data['nama_istri'] ?? null,
            'nama_anak' => $data['nama_anak'] ?? null,
            'hubungan_lain' => $data['hubungan_lain'] ?? null,
            'nama_hubungan_lain' => $data['nama_hubungan_lain'] ?? null,

            // Kontrak
            'mulai_kontrak' => $data['mulai_kontrak'] ?? null,
            'berakhir_kontrak' => $data['berakhir_kontrak'] ?? null,

            // Pemilik Usaha
            'nama_pemilik_usaha' => $data['nama_pemilik_usaha'] ?? null,
            'hp_pemilik_usaha' => $data['hp_pemilik_usaha'] ?? null,
            'jenis_usaha' => $data['jenis_usaha'] ?? null,
            'jenis_usaha_lainnya' => $data['jenis_usaha_lainnya'] ?? null,

            // Karyawan
            'jumlah_karyawan' => isset($data['jumlah_karyawan']) ? (int) $data['jumlah_karyawan'] : 0,
            'karyawan_menginap' => in_array($data['karyawan_menginap'] ?? null, [true, 1, '1', 'true', 'on'], true),
            'jumlah_karyawan_menginap' => isset($data['jumlah_karyawan_menginap']) ? (int) $data['jumlah_karyawan_menginap'] : 0,
            'nama_karyawan_menginap' => $data['nama_karyawan_menginap'] ?? null,

            // PIC Mahasiswa
            'nama_pic' => $data['nama_pic'] ?? null,
            'hp_pic' => $data['hp_pic'] ?? null,
            'nama_penghuni_lain' => $data['nama_penghuni_lain'] ?? null,

            // Kost individual
            'nama' => $data['nama'] ?? null,
            'hp' => $data['hp'] ?? null,

            // Personal identity
            'nama_lengkap' => $data['nama_lengkap'],
            'no_kk' => $data['no_kk'] ?? null,
            'no_ktp' => $data['no_ktp'] ?? null,
            'no_hp' => $data['no_hp'],
            'no_kontak_darurat' => $data['no_kontak_darurat'] ?? null,

            // Personal data
            'status_pernikahan' => $data['status_pernikahan'],
            'pekerjaan' => $data['pekerjaan'] ?? null,
            'agama' => $data['agama'],

            // Metadata
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

        // Store to public disk
        $file->storeAs('warga', $filename, 'public');

        return $path;
    }
}
