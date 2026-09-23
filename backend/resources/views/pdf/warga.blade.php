<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Data Warga Celeste</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 7px; color: #333; }
        .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #7B1B36;
        }
        .header h1 { color: #7B1B36; font-size: 14px; margin-bottom: 2px; }
        .header p { color: #666; font-size: 8px; }
        .meta { margin-bottom: 8px; font-size: 7px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        th {
            background-color: #7B1B36;
            color: white;
            padding: 3px 2px;
            text-align: left;
            font-size: 6px;
            font-weight: bold;
            border: 1px solid #5a1428;
        }
        td {
            padding: 2px 2px;
            border-bottom: 1px solid #ddd;
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
            vertical-align: top;
            font-size: 6px;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .badge {
            display: inline-block;
            padding: 1px 2px;
            border-radius: 2px;
            font-size: 5px;
            font-weight: bold;
        }
        .badge-milik { background: #E8F5E9; color: #2E7D32; }
        .badge-kontrak { background: #FFF3E0; color: #E65100; }
        .badge-kost { background: #E3F2FD; color: #1565C0; }
        .section-title {
            background-color: #f5f5f5;
            font-weight: bold;
            padding: 4px 2px;
            margin-top: 8px;
            margin-bottom: 0;
            font-size: 7px;
            border-left: 3px solid #7B1B36;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DATA WARGA CLUSTER CELESTE</h1>
        <p>Daftar Pendataan Warga - {{ $tanggal }}</p>
    </div>

    <div class="meta">
        <p>Total: <strong>{{ $total }}</strong> warga | Blok: {{ $blok ?: 'Semua' }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:2%">No</th>
                <th style="width:8%">Nama Lengkap</th>
                <th style="width:3%">Blok/Unit</th>
                <th style="width:5%">Status</th>
                <th style="width:5%">Sub Status</th>
                <th style="width:5%">No. HP</th>
                <th style="width:5%">HP Darurat</th>
                <th style="width:5%">Kontrak</th>
                <th style="width:5%">Nama Keluarga</th>
                <th style="width:5%">HP Keluarga</th>
                <th style="width:5%">Nama Usaha/PIC</th>
                <th style="width:5%">HP Usaha/PIC</th>
                <th style="width:5%">Jenis/Ket.</th>
                <th style="width:5%">Karyawan</th>
                <th style="width:5%">Penghuni</th>
                <th style="width:5%">Agama</th>
                <th style="width:5%">Pekerjaan</th>
                <th style="width:5%">Tgl Input</th>
            </tr>
        </thead>
        <tbody>
            @foreach($warga as $index => $row)
                <tr>
                    <td style="text-align:center">{{ $index + 1 }}</td>
                    <td>{{ $row->nama_lengkap }}</td>
                    <td>{{ $row->blok }}/{{ $row->unit }}</td>
                    <td>
                        <span class="badge badge-{{ $row->status_tempat_tinggal->value }}">
                            {{ $row->status_tempat_tinggal->label() }}
                        </span>
                    </td>
                    <td>{{ $row->sub_status?->label() ?? '-' }}</td>
                    <td>{{ $row->no_hp }}</td>
                    <td>{{ $row->no_kontak_darurat ?? '-' }}</td>
                    <td>
                        @if($row->mulai_kontrak && $row->berakhir_kontrak)
                            {{ $row->mulai_kontrak->format('d/m/Y') }} - {{ $row->berakhir_kontrak->format('d/m/Y') }}
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->status_tempat_tinggal->value === 'milik_sendiri')
                            {{ $row->nama_kepala_keluarga ?? '-' }}
                        @elseif($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'keluarga')
                            {{ $row->nama_kepala_keluarga ?? '-' }}
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->status_tempat_tinggal->value === 'milik_sendiri')
                            {{ $row->hp_kepala_keluarga ?? '-' }}
                        @elseif($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'keluarga')
                            {{ $row->hp_kepala_keluarga ?? '-' }}
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'usaha')
                            {{ $row->nama_pemilik_usaha ?? '-' }}
                        @elseif($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'mahasiswa')
                            {{ $row->nama_pic ?? '-' }}
                        @elseif($row->status_tempat_tinggal->value === 'kost')
                            {{ $row->nama ?? '-' }}
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'usaha')
                            {{ $row->hp_pemilik_usaha ?? '-' }}
                        @elseif($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'mahasiswa')
                            {{ $row->hp_pic ?? '-' }}
                        @elseif($row->status_tempat_tinggal->value === 'kost')
                            {{ $row->hp ?? '-' }}
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'usaha')
                            {{ $row->jenis_usaha ?? '-' }}{{ $row->jenis_usaha === 'jasa' && $row->jenis_usaha_lainnya ? " ({$row->jenis_usaha_lainnya})" : '' }}
                        @elseif($row->status_tempat_tinggal->value === 'kost')
                            Kost
                        @elseif($row->nama_istri || $row->nama_anak || $row->nama_hubungan_lain)
                            @if($row->nama_istri) Istri: {{ $row->nama_istri }} @endif
                            @if($row->nama_anak) | Anak: {{ $row->nama_anak }} @endif
                            @if($row->nama_hubungan_lain) | {{ $row->hubungan_lain }}: {{ $row->nama_hubungan_lain }} @endif
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->status_tempat_tinggal->value === 'kontrak' && $row->sub_status?->value === 'usaha')
                            {{ $row->jumlah_karyawan ?? 0 }}
                            @if($row->karyawan_menginap && $row->nama_karyawan_menginap)
                                <br><small style="color:#c00">(menginap: {{ $row->nama_karyawan_menginap }})</small>
                            @endif
                        @else
                            -
                        @endif
                    </td>
                    <td>
                        @if($row->nama_penghuni_lain)
                            {{ $row->nama_penghuni_lain }}
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $row->agama->label() }}</td>
                    <td>{{ $row->pekerjaan ?? '-' }}</td>
                    <td>{{ $row->created_at->format('d/m/Y') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    @if($warga->count() === 0)
        <p style="text-align:center; color:#999; padding:40px;">Tidak ada data warga</p>
    @endif
</body>
</html>
