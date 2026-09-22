<?php

namespace App\Enums;

enum HubunganLain: string
{
    case ART = 'art';
    case SAUDARA = 'saudara';
    case ORANG_TUA = 'orang_tua';
    case MERTUA = 'mertua';

    public function label(): string
    {
        return match($this) {
            self::ART => 'ART (Asisten Rumah Tangga)',
            self::SAUDARA => 'Saudara',
            self::ORANG_TUA => 'Orang Tua',
            self::MERTUA => 'Mertua',
        };
    }
}
