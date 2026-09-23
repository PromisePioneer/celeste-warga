<?php

namespace App\Http\Requests;

use App\Enums\Agama;
use App\Enums\StatusPernikahan;
use App\Enums\StatusTempatTinggal;
use App\Enums\SubStatusKontrak;
use App\Enums\HubunganLain;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreWargaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $blokConfig = config('celeste.blok');
        $statusTempatTinggal = $this->input('status_tempat_tinggal');

        $rules = [
            // Step 1: Tempat Tinggal
            'blok' => ['required', 'string', function ($attribute, $value, $fail) use ($blokConfig) {
                if (!isset($blokConfig[$value])) {
                    $fail('Blok yang dipilih tidak valid.');
                }
            }],
            'unit' => ['required', 'string', function ($attribute, $value, $fail) use ($blokConfig) {
                $blok = $this->input('blok');
                if ($blok && isset($blokConfig[$blok])) {
                    if (!in_array($value, $blokConfig[$blok]['units'])) {
                        $fail('Unit yang dipilih tidak valid untuk blok ini.');
                    }
                } else {
                    $fail('Pilih blok terlebih dahulu.');
                }
            }],
            'status_tempat_tinggal' => ['required', new Enum(StatusTempatTinggal::class)],

            // Milik Sendiri fields
            'nama_kepala_keluarga' => ['nullable', 'string', 'min:2', 'max:255'],
            'hp_kepala_keluarga' => ['nullable', 'string', 'max:20'],
            'nama_istri' => ['nullable', 'string', 'max:255'],
            'nama_anak' => ['nullable', 'string', 'max:500'],
            'hubungan_lain' => ['nullable', 'string', 'in:art,saudara,orang_tua,mertua'],
            'nama_hubungan_lain' => ['nullable', 'string', 'max:255'],

            // Kontrak fields
            'sub_status' => ['nullable', new Enum(SubStatusKontrak::class)],
            'mulai_kontrak' => ['nullable', 'date'],
            'berakhir_kontrak' => ['nullable', 'date'],
            'nama_pemilik_usaha' => ['nullable', 'string', 'min:2', 'max:255'],
            'hp_pemilik_usaha' => ['nullable', 'string', 'max:20'],
            'jenis_usaha' => ['nullable', 'string'],
            'jenis_usaha_lainnya' => ['nullable', 'string', 'max:255'],
            'jumlah_karyawan' => ['nullable', 'integer', 'min:0'],
            'karyawan_menginap' => ['nullable', 'in:0,1,true,false'],
            'jumlah_karyawan_menginap' => ['nullable', 'integer', 'min:0'],
            'nama_karyawan_menginap' => ['nullable', 'string', 'max:1000'],

            // PIC Mahasiswa
            'nama_pic' => ['nullable', 'string', 'min:2', 'max:255'],
            'hp_pic' => ['nullable', 'string', 'max:20'],
            'nama_penghuni_lain' => ['nullable', 'string', 'max:500'],

            // Step 2: Identitas
            'nama_lengkap' => ['required', 'string', 'min:2', 'max:255'],
            'no_kk' => ['nullable', 'string', 'size:16', 'regex:/^\d{16}$/'],
            'no_ktp' => ['nullable', 'string', 'size:16', 'regex:/^\d{16}$/'],
            'no_hp' => ['required', 'string', 'min:10', 'max:20', 'regex:/^[\d+\s]+$/'],

            // Step 3: Data Diri
            'status_pernikahan' => ['required', new Enum(StatusPernikahan::class)],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'agama' => ['required', new Enum(Agama::class)],
            'no_kontak_darurat' => ['required', 'string', 'min:10', 'max:20', 'regex:/^[\d+\s]+$/'],

            // Step 4: Foto (all optional)
            'foto_kk' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'foto_ktp' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'foto_keluarga' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'foto_selfie' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];

        // Conditional validation based on status_tempat_tinggal
        if ($statusTempatTinggal === 'milik_sendiri') {
            $rules['nama_kepala_keluarga'] = ['required', 'string', 'min:2', 'max:255'];
            $rules['hp_kepala_keluarga'] = ['required', 'string', 'min:10', 'max:20'];
        }

        if ($statusTempatTinggal === 'kontrak') {
            $subStatus = $this->input('sub_status');

            if ($subStatus === 'usaha') {
                $rules['mulai_kontrak'] = ['required', 'date'];
                $rules['berakhir_kontrak'] = ['required', 'date'];
                $rules['nama_pemilik_usaha'] = ['required', 'string', 'min:2', 'max:255'];
                $rules['hp_pemilik_usaha'] = ['required', 'string', 'min:10', 'max:20'];
                $rules['jenis_usaha'] = ['required', 'string'];

                // Karyawan menginap conditional validation
                $karyawanMenginap = $this->input('karyawan_menginap');
                if ($karyawanMenginap == 'true' || $karyawanMenginap == 1 || $karyawanMenginap == '1') {
                    $rules['jumlah_karyawan_menginap'] = ['required', 'integer', 'min:1'];
                    $rules['nama_karyawan_menginap'] = ['required', 'string', 'min:2'];
                }
            }

            if ($subStatus === 'keluarga') {
                $rules['mulai_kontrak'] = ['required', 'date'];
                $rules['berakhir_kontrak'] = ['required', 'date'];
                $rules['nama_kepala_keluarga'] = ['required', 'string', 'min:2', 'max:255'];
                $rules['hp_kepala_keluarga'] = ['required', 'string', 'min:10', 'max:20'];
            }

            if ($subStatus === 'mahasiswa') {
                $rules['nama_pic'] = ['required', 'string', 'min:2', 'max:255'];
                $rules['hp_pic'] = ['required', 'string', 'min:10', 'max:20'];
            }
        }

        if ($statusTempatTinggal === 'kost') {
            $rules['mulai_kontrak'] = ['required', 'date'];
            $rules['berakhir_kontrak'] = ['required', 'date'];
            $rules['nama'] = ['required', 'string', 'min:2', 'max:255'];
            $rules['hp'] = ['required', 'string', 'min:10', 'max:20'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'blok.required' => 'Pilih blok rumah.',
            'unit.required' => 'Pilih unit rumah.',
            'status_tempat_tinggal.required' => 'Pilih status tempat tinggal.',
            'sub_status.required' => 'Pilih tipe kontrak.',
            'nama_kepala_keluarga.required' => 'Nama kepala keluarga wajib diisi.',
            'nama_kepala_keluarga.min' => 'Nama minimal 2 karakter.',
            'hp_kepala_keluarga.required' => 'No. HP kepala keluarga wajib diisi.',
            'hp_kepala_keluarga.min' => 'No. HP minimal 10 digit.',
            'mulai_kontrak.required' => 'Tanggal mulai kontrak wajib diisi.',
            'berakhir_kontrak.required' => 'Tanggal berakhir kontrak wajib diisi.',
            'nama_pemilik_usaha.required' => 'Nama pemilik usaha wajib diisi.',
            'hp_pemilik_usaha.required' => 'No. HP pemilik usaha wajib diisi.',
            'jenis_usaha.required' => 'Pilih jenis usaha.',
            'jumlah_karyawan_menginap.required' => 'Jumlah karyawan menginap wajib diisi.',
            'nama_karyawan_menginap.required' => 'Nama karyawan menginap wajib diisi.',
            'nama_pic.required' => 'Nama PIC wajib diisi.',
            'hp_pic.required' => 'No. HP PIC wajib diisi.',
            'nama.required' => 'Nama wajib diisi.',
            'nama.min' => 'Nama minimal 2 karakter.',
            'hp.required' => 'No. HP wajib diisi.',
            'hp.min' => 'No. HP minimal 10 digit.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'no_kk.size' => 'No. KK harus 16 digit.',
            'no_kk.regex' => 'No. KK harus berupa angka.',
            'no_ktp.size' => 'No. KTP harus 16 digit.',
            'no_ktp.regex' => 'No. KTP harus berupa angka.',
            'no_hp.required' => 'No. HP wajib diisi.',
            'no_hp.min' => 'No. HP minimal 10 digit.',
            'no_kontak_darurat.required' => 'No. Kontak darurat wajib diisi.',
            'no_kontak_darurat.min' => 'No. Kontak darurat minimal 10 digit.',
            'no_kontak_darurat.regex' => 'Format No. Kontak darurat tidak valid.',
            'status_pernikahan.required' => 'Pilih status pernikahan.',
            'agama.required' => 'Pilih agama.',
            'foto_kk.image' => 'Foto KK harus berupa gambar.',
            'foto_ktp.image' => 'Foto KTP harus berupa gambar.',
        ];
    }
}
