<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'nama_kepala_keluarga' => $this->nama_kepala_keluarga,
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
                'kk' => $this->foto_kk ? route('admin.warga.foto', ['warga' => $this->id, 'jenis' => 'foto_kk']) : null,
                'ktp' => $this->foto_ktp ? route('admin.warga.foto', ['warga' => $this->id, 'jenis' => 'foto_ktp']) : null,
                'keluarga' => $this->foto_keluarga ? route('admin.warga.foto', ['warga' => $this->id, 'jenis' => 'foto_keluarga']) : null,
                'selfie' => $this->foto_selfie ? route('admin.warga.foto', ['warga' => $this->id, 'jenis' => 'foto_selfie']) : null,
            ],
            'has_photo' => $this->hasAnyPhoto(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
