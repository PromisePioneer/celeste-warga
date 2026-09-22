<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            // Ubah status_tempat_tinggal menjadi hanya 2 pilihan
            $table->dropColumn('status_tempat_tinggal');

            // Tambah kolom baru
            $table->enum('status_tempat_tinggal', ['milik_sendiri', 'kontrak', 'kost'])->default('milik_sendiri')->after('unit');
            $table->enum('sub_status', ['milik_sendiri', 'usaha', 'keluarga', 'mahasiswa'])->nullable()->after('status_tempat_tinggal');

            // HP Kepala Keluarga
            $table->string('hp_kepala_keluarga', 20)->nullable()->after('nama_kepala_keluarga');

            // Anggota keluarga
            $table->string('nama_istri', 255)->nullable()->after('hp_kepala_keluarga');
            $table->string('nama_anak', 500)->nullable()->after('nama_istri');
            $table->string('hubungan_lain', 50)->nullable()->after('nama_anak');
            $table->string('nama_hubungan_lain', 255)->nullable()->after('hubungan_lain');

            // Kontrak fields
            $table->date('mulai_kontrak')->nullable()->after('nama_hubungan_lain');
            $table->date('berakhir_kontrak')->nullable()->after('mulai_kontrak');

            // Pemilik usaha
            $table->string('nama_pemilik_usaha', 255)->nullable()->after('berakhir_kontrak');
            $table->string('hp_pemilik_usaha', 20)->nullable()->after('nama_pemilik_usaha');

            // Jenis usaha
            $table->enum('jenis_usaha', ['jasa', 'kebutuhan_harian', 'laundry', 'catering', 'online_shop'])->nullable()->after('hp_pemilik_usaha');
            $table->string('jenis_usaha_lainnya', 255)->nullable()->after('jenis_usaha');

            // Karyawan
            $table->integer('jumlah_karyawan')->unsigned()->nullable()->default(0)->after('jenis_usaha_lainnya');
            $table->boolean('karyawan_menginap')->default(false)->after('jumlah_karyawan');
            $table->integer('jumlah_karyawan_menginap')->unsigned()->nullable()->default(0)->after('karyawan_menginap');
            $table->text('nama_karyawan_menginap')->nullable()->after('jumlah_karyawan_menginap');

            // PIC Mahasiswa
            $table->string('nama_pic', 255)->nullable()->after('nama_karyawan_menginap');
            $table->string('hp_pic', 20)->nullable()->after('nama_pic');
            $table->string('nama_penghuni_lain', 500)->nullable()->after('hp_pic');

            // Kost individual
            $table->string('nama', 255)->nullable()->after('nama_penghuni_lain');
            $table->string('hp', 20)->nullable()->after('nama');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn([
                'status_tempat_tinggal',
                'sub_status',
                'hp_kepala_keluarga',
                'nama_istri',
                'nama_anak',
                'hubungan_lain',
                'nama_hubungan_lain',
                'mulai_kontrak',
                'berakhir_kontrak',
                'nama_pemilik_usaha',
                'hp_pemilik_usaha',
                'jenis_usaha',
                'jenis_usaha_lainnya',
                'jumlah_karyawan',
                'karyawan_menginap',
                'jumlah_karyawan_menginap',
                'nama_karyawan_menginap',
                'nama_pic',
                'hp_pic',
                'nama_penghuni_lain',
                'nama',
                'hp',
            ]);

            // Restore original enum
            $table->enum('status_tempat_tinggal', [
                'milik_sendiri',
                'kontrak',
                'kontrak_keluarga',
                'kontrak_mahasiswa',
                'kost',
                'istri',
                'anak',
            ])->after('unit');
        });
    }
};
