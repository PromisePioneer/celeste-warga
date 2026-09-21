<?php

namespace App\Enums;

enum StatusPernikahan: string
{
    case BELUM_KAWIN = 'belum_kawin';
    case KAWIN = 'kawin';
    case CERAI_HIDUP = 'cerai_hidup';
    case CERAI_MATI = 'cerai_mati';

    public function label(): string
    {
        return match($this) {
            self::BELUM_KAWIN => 'Belum Kawin',
            self::KAWIN => 'Kawin',
            self::CERAI_HIDUP => 'Cerai Hidup',
            self::CERAI_MATI => 'Cerai Mati',
        };
    }
}
