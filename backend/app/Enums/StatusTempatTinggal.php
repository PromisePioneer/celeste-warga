<?php

namespace App\Enums;

enum StatusTempatTinggal: string
{
    case MILIK_SENDIRI = 'milik_sendiri';
    case KONTRAK = 'kontrak';
    case KONTRAK_KELUARGA = 'kontrak_keluarga';
    case KONTRAK_MAHASISWA = 'kontrak_mahasiswa';
    case KOST = 'kost';
    case ISTRI = 'istri';
    case ANAK = 'anak';

    public function label(): string
    {
        return match($this) {
            self::MILIK_SENDIRI => 'Milik Sendiri',
            self::KONTRAK => 'Kontrak',
            self::KONTRAK_KELUARGA => 'Kontrak Keluarga',
            self::KONTRAK_MAHASISWA => 'Kontrak Mahasiswa',
            self::KOST => 'Kost',
            self::ISTRI => 'Istri',
            self::ANAK => 'Anak',
        };
    }

    public function isHunian(): bool
    {
        return in_array($this, [
            self::MILIK_SENDIRI,
            self::KONTRAK,
            self::KONTRAK_KELUARGA,
            self::KONTRAK_MAHASISWA,
            self::KOST,
        ]);
    }

    public function isAnggotaKeluarga(): bool
    {
        return in_array($this, [self::ISTRI, self::ANAK]);
    }
}
