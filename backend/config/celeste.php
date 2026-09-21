<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Celeste Block Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration defines the available blocks and their units
    | in the Celeste complex. Each block has a set of allowed units.
    |
    */

    'blok' => [
        '89.A-P' => [
            'label' => 'Blok 89.A-P',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
        ],
        '18.A-V' => [
            'label' => 'Blok 18.A-V',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
        ],
        '19.A-V' => [
            'label' => 'Blok 19.A-V',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
        ],
        '99.A-S' => [
            'label' => 'Blok 99.A-S',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
        ],
        '8.A-K' => [
            'label' => 'Blok 8.A-K',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
        ],
        '9.A-W' => [
            'label' => 'Blok 9.A-W',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'],
        ],
        '9.AA-AC' => [
            'label' => 'Blok 9.AA-AC',
            'units' => ['AA', 'AB', 'AC'],
        ],
    ],

    'status_tempat_tinggal' => [
        'hunian' => [
            'milik_sendiri' => 'Milik Sendiri',
            'kontrak' => 'Kontrak',
            'kontrak_keluarga' => 'Kontrak Keluarga',
            'kontrak_mahasiswa' => 'Kontrak Mahasiswa',
            'kost' => 'Kost',
        ],
        'anggota_keluarga' => [
            'istri' => 'Istri',
            'anak' => 'Anak',
        ],
    ],

    'agama' => [
        'islam' => 'Islam',
        'kristen' => 'Kristen',
        'katolik' => 'Katolik',
        'hindu' => 'Hindu',
        'buddha' => 'Buddha',
        'konghucu' => 'Konghucu',
        'lainnya' => 'Lainnya',
    ],

    'status_pernikahan' => [
        'belum_kawin' => 'Belum Kawin',
        'kawin' => 'Kawin',
        'cerai_hidup' => 'Cerai Hidup',
        'cerai_mati' => 'Cerai Mati',
    ],
];
