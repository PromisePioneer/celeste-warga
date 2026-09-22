<?php

namespace Database\Factories;

use App\Models\Warga;
use Illuminate\Database\Eloquent\Factories\Factory;

class WargaFactory extends Factory
{
    protected $model = Warga::class;

    public function definition(): array
    {
        $bloks = array_keys(config('celeste.blok'));
        $statusTempatTinggal = ['milik_sendiri', 'kontrak'];
        $subStatuses = ['milik_sendiri', 'usaha', 'keluarga', 'mahasiswa'];
        $statusPernikahan = ['belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati'];
        $agamas = ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu'];
        $jenisUsaha = ['jasa', 'kebutuhan_harian', 'laundry', 'catering', 'online_shop'];
        $hubunganLain = ['art', 'saudara', 'orang_tua', 'mertua'];

        return [
            'blok' => $this->faker->randomElement($bloks),
            'unit' => chr($this->faker->numberBetween(65, 70)), // A-F
            'status_tempat_tinggal' => $this->faker->randomElement($statusTempatTinggal),
            'sub_status' => $this->faker->randomElement($subStatuses),
            'nama_kepala_keluarga' => $this->faker->name(),
            'hp_kepala_keluarga' => '08' . $this->faker->numerify('##########'),
            'nama_istri' => $this->faker->optional()->name('female'),
            'nama_anak' => $this->faker->optional()->name(),
            'hubungan_lain' => $this->faker->optional()->randomElement($hubunganLain),
            'nama_hubungan_lain' => $this->faker->optional()->name(),
            'mulai_kontrak' => $this->faker->optional()->date(),
            'berakhir_kontrak' => $this->faker->optional()->date(),
            'nama_pemilik_usaha' => $this->faker->optional()->name(),
            'hp_pemilik_usaha' => $this->faker->optional()->numerify('08##########'),
            'jenis_usaha' => $this->faker->optional()->randomElement($jenisUsaha),
            'jenis_usaha_lainnya' => $this->faker->optional()->word(),
            'jumlah_karyawan' => $this->faker->numberBetween(0, 10),
            'karyawan_menginap' => $this->faker->boolean(),
            'jumlah_karyawan_menginap' => $this->faker->numberBetween(0, 5),
            'nama_karyawan_menginap' => $this->faker->optional()->name(),
            'nama_pic' => $this->faker->optional()->name(),
            'hp_pic' => $this->faker->optional()->numerify('08##########'),
            'nama_penghuni_lain' => $this->faker->optional()->name(),
            'nama_lengkap' => $this->faker->name(),
            'no_kk' => $this->faker->numerify('################'),
            'no_ktp' => $this->faker->unique()->numerify('################'),
            'no_hp' => '08' . $this->faker->numerify('##########'),
            'no_kontak_darurat' => $this->faker->optional()->numerify('08##########'),
            'status_pernikahan' => $this->faker->randomElement($statusPernikahan),
            'pekerjaan' => $this->faker->randomElement(['pegawai_negeri', 'pegawai_swasta', 'wiraswasta', 'guru', 'dokter', 'lainnya']),
            'agama' => $this->faker->randomElement($agamas),
            'ip_pengisi' => '127.0.0.1',
        ];
    }
}
