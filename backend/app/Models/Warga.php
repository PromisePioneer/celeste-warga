<?php

namespace App\Models;

use App\Enums\Agama;
use App\Enums\StatusPernikahan;
use App\Enums\StatusTempatTinggal;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Warga extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'warga';

    protected $fillable = [
        'blok',
        'unit',
        'status_tempat_tinggal',
        'nama_kepala_keluarga',
        'nama_lengkap',
        'no_kk',           // Will be encrypted by mutator
        'no_ktp',          // Will be encrypted by mutator
        'no_ktp_hash',
        'no_hp',
        'no_kontak_darurat',
        'status_pernikahan',
        'pekerjaan',
        'agama',
        'foto_kk',
        'foto_ktp',
        'foto_keluarga',
        'foto_selfie',
        'ip_pengisi',
    ];

    protected $hidden = [
        'no_kk_encrypted',
        'no_ktp_encrypted',
    ];

    protected $casts = [
        'status_tempat_tinggal' => StatusTempatTinggal::class,
        'status_pernikahan' => StatusPernikahan::class,
        'agama' => Agama::class,
    ];

    /**
     * Get full address
     */
    public function getAlamatAttribute(): string
    {
        return "Blok {$this->blok}, Unit {$this->unit}";
    }

    /**
     * Encrypt KK number
     */
    public function setNoKkAttribute(string $value): void
    {
        $this->attributes['no_kk_encrypted'] = Crypt::encryptString($value);
    }

    /**
     * Decrypt KK number
     */
    public function getNoKkAttribute(): ?string
    {
        if (empty($this->attributes['no_kk_encrypted'])) {
            return null;
        }

        try {
            return Crypt::decryptString($this->attributes['no_kk_encrypted']);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Encrypt KTP number
     */
    public function setNoKtpAttribute(string $value): void
    {
        $this->attributes['no_ktp_encrypted'] = Crypt::encryptString($value);
        $this->attributes['no_ktp_hash'] = hash_hmac('sha256', $value, config('app.key'));
    }

    /**
     * Decrypt KTP number (for admin only)
     */
    public function getNoKtpAttribute(): ?string
    {
        if (empty($this->attributes['no_ktp_encrypted'])) {
            return null;
        }

        try {
            return Crypt::decryptString($this->attributes['no_ktp_encrypted']);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get masked KTP for display
     */
    public function getNoKtpMaskedAttribute(): string
    {
        $ktp = $this->no_ktp;
        if (!$ktp) {
            return '••••••••••••••••';
        }

        return substr($ktp, 0, 4) . '••••••••' . substr($ktp, -4);
    }

    /**
     * Get masked KK for display
     */
    public function getNoKkMaskedAttribute(): string
    {
        $kk = $this->no_kk;
        if (!$kk) {
            return '••••••••••••••••';
        }

        return substr($kk, 0, 4) . '••••••••' . substr($kk, -4);
    }

    /**
     * Check if warga has photos
     */
    public function hasAnyPhoto(): bool
    {
        return $this->foto_kk || $this->foto_ktp || $this->foto_keluarga || $this->foto_selfie;
    }

    /**
     * Get all photo paths
     */
    public function getPhotosAttribute(): array
    {
        return array_filter([
            'foto_kk' => $this->foto_kk,
            'foto_ktp' => $this->foto_ktp,
            'foto_keluarga' => $this->foto_keluarga,
            'foto_selfie' => $this->foto_selfie,
        ]);
    }
}
