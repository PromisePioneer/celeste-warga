<?php

namespace App\Enums;

enum StatusTempatTinggal: string
{
    case MILIK_SENDIRI = 'milik_sendiri';
    case KONTRAK = 'kontrak';
    case KOST = 'kost';

    public function label(): string
    {
        return match($this) {
            self::MILIK_SENDIRI => 'Milik Sendiri',
            self::KONTRAK => 'Kontrak',
            self::KOST => 'Kost',
        };
    }
}
