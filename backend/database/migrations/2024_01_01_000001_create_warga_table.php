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
        Schema::create('warga', function (Blueprint $table) {
            $table->id();
            $table->string('blok', 20);
            $table->string('unit', 10);
            $table->enum('status_tempat_tinggal', [
                'milik_sendiri',
                'kontrak',
                'kontrak_keluarga',
                'kontrak_mahasiswa',
                'kost',
                'istri',
                'anak',
            ]);
            $table->string('nama_kepala_keluarga', 255);

            // Personal identity
            $table->string('nama_lengkap', 255);
            $table->text('no_kk_encrypted'); // Encrypted KK number
            $table->text('no_ktp_encrypted'); // Encrypted KTP number
            $table->string('no_ktp_hash', 64)->unique(); // HMAC-SHA256 hash for duplicate detection
            $table->string('no_hp', 20);
            $table->string('no_kontak_darurat', 20)->nullable();

            // Personal data
            $table->enum('status_pernikahan', [
                'belum_kawin',
                'kawin',
                'cerai_hidup',
                'cerai_mati',
            ]);
            $table->string('pekerjaan', 100)->nullable();
            $table->enum('agama', [
                'islam',
                'kristen',
                'katolik',
                'hindu',
                'buddha',
                'konghucu',
                'lainnya',
            ]);

            // Photos (stored as file paths)
            $table->string('foto_kk')->nullable();
            $table->string('foto_ktp')->nullable();
            $table->string('foto_keluarga')->nullable();
            $table->string('foto_selfie')->nullable();

            // Metadata
            $table->string('ip_pengisi', 45)->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['blok', 'unit']);
            $table->index('status_tempat_tinggal');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warga');
    }
};
