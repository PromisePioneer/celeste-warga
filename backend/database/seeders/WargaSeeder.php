<?php

namespace Database\Seeders;

use App\Models\Warga;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class WargaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define blocks inline to avoid config loading issues
        $blokConfig = [
            '89.A-P' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
            '18.A-V' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
            '19.A-V' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
            '99.A-S' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
            '8.A-K' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
            '9.A-W' => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'],
            '9.AA-AC' => ['AA', 'AB', 'AC'],
        ];

        $bloks = array_keys($blokConfig);
        $statusTempatTinggal = ['milik_sendiri', 'kontrak', 'kontrak_keluarga', 'kost', 'istri', 'anak'];
        $statusPernikahan = ['belum_kawin', 'kawin', 'cerai_hidup', 'cerai_mati'];
        $agamas = ['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu'];
        $pekerjaans = ['Pegawai Swasta', 'PNS', 'Wiraswasta', 'Guru', 'Dokter', 'Pengusaha', 'Pensiunan', 'Ibu Rumah Tangga', 'Pelajar', 'Mahasiswa'];

        $namaDepan = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hadi', 'Indah', 'Joko', 'Kartika', 'Lina', 'Made', 'Nina', 'Oka', 'Putu', 'Rina', 'Sari', 'Tika', 'Umar'];
        $namaBelakang = ['Santoso', 'Wijaya', 'Kusuma', 'Pratiwi', 'Nugroho', 'Susanto', 'Wulandari', 'Hidayat', 'Permana', 'Darmawan', 'Suryani', 'Karningsih', 'Wati', 'Hasanah', 'Saputra'];

        $faker = \Faker\Factory::create('id_ID');

        for ($i = 0; $i < 30; $i++) {
            $blok = $faker->randomElement($bloks);
            $units = $blokConfig[$blok];
            $unit = $faker->randomElement($units);

            $namaDepanValue = $faker->randomElement($namaDepan);
            $namaBelakangValue = $faker->randomElement($namaBelakang);
            $namaLengkap = $namaDepanValue . ' ' . $namaBelakangValue;

            $status = $faker->randomElement($statusTempatTinggal);
            $noKtp = $faker->unique()->numerify('################');
            $noKk = $faker->numerify('################');

            $createdAt = Carbon::now()->subDays(rand(1, 30));

            Warga::create([
                'blok' => $blok,
                'unit' => $unit,
                'status_tempat_tinggal' => $status,
                'nama_kepala_keluarga' => $namaLengkap,
                'nama_lengkap' => $namaLengkap,
                'no_kk' => $noKk,
                'no_ktp' => $noKtp,
                'no_hp' => '08' . $faker->numerify('##########'),
                'no_kontak_darurat' => rand(0, 1) ? '08' . $faker->numerify('##########') : null,
                'status_pernikahan' => $faker->randomElement($statusPernikahan),
                'pekerjaan' => $faker->randomElement($pekerjaans),
                'agama' => $faker->randomElement($agamas),
                'foto_kk' => null,
                'foto_ktp' => null,
                'foto_keluarga' => null,
                'foto_selfie' => null,
                'ip_pengisi' => '127.0.0.1',
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
