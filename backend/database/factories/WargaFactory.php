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
        $statusTempatTinggal = ['milik_sendiri', 'kontrak', 'kontrak_keluarga', 'kost', 'istri', 'anak'];
        $statusPernikahan = ['belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati'];
        $agamas = ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu'];

        return [
            'blok' => $this->faker->randomElement($bloks),
            'unit' => chr($this->faker->numberBetween(65, 70)), // A-F
            'status_tempat_tinggal' => $this->faker->randomElement($statusTempatTinggal),
            'nama_kepala_keluarga' => $this->faker->name(),
            'nama_lengkap' => $this->faker->name(),
            'no_kk' => $this->faker->numerify('################'),
            'no_ktp' => $this->faker->unique()->numerify('################'),
            'no_hp' => '08' . $this->faker->numerify('##########'),
            'no_kontak_darurat' => $this->faker->optional()->numerify('08##########'),
            'status_pernikahan' => $this->faker->randomElement($statusPernikahan),
            'pekerjaan' => $this->faker->randomElement(['Pegawai Swasta', 'PNS', 'Wiraswasta', 'Guru']),
            'agama' => $this->faker->randomElement($agamas),
            'ip_pengisi' => '127.0.0.1',
        ];
    }
}
