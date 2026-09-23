<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class WargaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'blok' => $this->blok,
            'unit' => $this->unit,
            'alamat' => $this->alamat,
            'status_tempat_tinggal' => [
                'value' => $this->status_tempat_tinggal->value,
                'label' => $this->status_tempat_tinggal->label(),
            ],
            'sub_status' => $this->sub_status ? [
                'value' => $this->sub_status->value,
                'label' => $this->sub_status->label(),
            ] : null,
            'nama_kepala_keluarga' => $this->nama_kepala_keluarga,
            'hp_kepala_keluarga' => $this->hp_kepala_keluarga,
            'nama_istri' => $this->nama_istri,
            'nama_anak' => $this->nama_anak,
            'hubungan_lain' => $this->hubungan_lain,
            'nama_hubungan_lain' => $this->nama_hubungan_lain,
            // Kontrak fields
            'mulai_kontrak' => $this->mulai_kontrak?->format('d/m/Y'),
            'berakhir_kontrak' => $this->berakhir_kontrak?->format('d/m/Y'),
            'nama_pemilik_usaha' => $this->nama_pemilik_usaha,
            'hp_pemilik_usaha' => $this->hp_pemilik_usaha,
            'jenis_usaha' => $this->jenis_usaha,
            'jenis_usaha_lainnya' => $this->jenis_usaha_lainnya,
            'jumlah_karyawan' => $this->jumlah_karyawan,
            'karyawan_menginap' => $this->karyawan_menginap,
            'jumlah_karyawan_menginap' => $this->jumlah_karyawan_menginap,
            'nama_karyawan_menginap' => $this->nama_karyawan_menginap,
            // PIC & Kost
            'nama_pic' => $this->nama_pic,
            'hp_pic' => $this->hp_pic,
            'nama_penghuni_lain' => $this->nama_penghuni_lain,
            // Kost individual
            'nama' => $this->nama,
            'hp' => $this->hp,
            // Personal
            'nama_lengkap' => $this->nama_lengkap,
            'no_kk_masked' => $this->no_kk_masked,
            'no_ktp_masked' => $this->no_ktp_masked,
            'no_hp' => $this->no_hp,
            'no_kontak_darurat' => $this->no_kontak_darurat,
            'status_pernikahan' => [
                'value' => $this->status_pernikahan->value,
                'label' => $this->status_pernikahan->label(),
            ],
            'pekerjaan' => $this->pekerjaan,
            'agama' => [
                'value' => $this->agama->value,
                'label' => $this->agama->label(),
            ],
            'foto' => [
                'keluarga' => $this->foto_keluarga ? url('/api/storage/' . $this->foto_keluarga) : null,
                'selfie' => $this->foto_selfie ? url('/api/storage/' . $this->foto_selfie) : null,
            ],
            'has_photo' => $this->hasAnyPhoto(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
