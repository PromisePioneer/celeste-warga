<?php

namespace App\Http\Requests;

use App\Enums\Agama;
use App\Enums\StatusPernikahan;
use App\Enums\StatusTempatTinggal;
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
            'nama_kepala_keluarga' => ['required', 'string', 'min:2', 'max:255'],

            // Step 2: Identitas
            'nama_lengkap' => ['required', 'string', 'min:2', 'max:255'],
            'no_kk' => ['required', 'string', 'size:16', 'regex:/^\d{16}$/'],
            'no_ktp' => ['required', 'string', 'size:16', 'regex:/^\d{16}$/'],
            'no_hp' => ['required', 'string', 'min:10', 'max:20', 'regex:/^[\d+\s]+$/'],

            // Step 3: Data Diri
            'status_pernikahan' => ['required', new Enum(StatusPernikahan::class)],
            'pekerjaan' => ['nullable', 'string', 'max:100'],
            'agama' => ['required', new Enum(Agama::class)],
            'no_kontak_darurat' => ['nullable', 'string', 'max:20'],

            // Step 4: Foto (all optional)
            'foto_kk' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'foto_ktp' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'foto_keluarga' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'foto_selfie' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'blok.required' => 'Pilih blok rumah.',
            'unit.required' => 'Pilih unit rumah.',
            'status_tempat_tinggal.required' => 'Pilih status tempat tinggal.',
            'nama_kepala_keluarga.required' => 'Nama kepala keluarga wajib diisi.',
            'nama_kepala_keluarga.min' => 'Nama minimal 2 karakter.',
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'no_kk.required' => 'No. Kartu Keluarga wajib diisi.',
            'no_kk.size' => 'No. KK harus 16 digit.',
            'no_kk.regex' => 'No. KK harus berupa angka.',
            'no_ktp.required' => 'No. KTP wajib diisi.',
            'no_ktp.size' => 'No. KTP harus 16 digit.',
            'no_ktp.regex' => 'No. KTP harus berupa angka.',
            'no_hp.required' => 'No. HP wajib diisi.',
            'no_hp.min' => 'No. HP minimal 10 digit.',
            'status_pernikahan.required' => 'Pilih status pernikahan.',
            'agama.required' => 'Pilih agama.',
            'foto_kk.image' => 'Foto KK harus berupa gambar.',
            'foto_ktp.image' => 'Foto KTP harus berupa gambar.',
        ];
    }
}
