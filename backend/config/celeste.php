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
        '89' => [
            'label' => 'Blok 89',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
        ],
        '18' => [
            'label' => 'Blok 18',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
        ],
        '19' => [
            'label' => 'Blok 19',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
        ],
        '99' => [
            'label' => 'Blok 99',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
        ],
        '8' => [
            'label' => 'Blok 8',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
        ],
        '9' => [
            'label' => 'Blok 9',
            'units' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'AA', 'AB', 'AC'],
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
