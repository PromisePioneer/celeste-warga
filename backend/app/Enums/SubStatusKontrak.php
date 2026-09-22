<?php

namespace App\Enums;

enum SubStatusKontrak: string
{
    case MILIK_SENDIRI = 'milik_sendiri';
    case USAHA = 'usaha';
    case KELUARGA = 'keluarga';
    case MAHASISWA = 'mahasiswa';

    public function label(): string
    {
        return match($this) {
            self::MILIK_SENDIRI => 'Milik Sendiri',
            self::USAHA => 'Usaha',
            self::KELUARGA => 'Keluarga',
            self::MAHASISWA => 'Mahasiswa',
        };
    }
}
