<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop unique constraint first if it exists
        DB::statement('ALTER TABLE warga DROP INDEX IF EXISTS warga_no_ktp_hash_unique');

        // Change columns to nullable
        Schema::table('warga', function (Blueprint $table) {
            $table->text('no_kk_encrypted')->nullable()->change();
            $table->string('no_ktp_hash', 64)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warga', function (Blueprint $table) {
            $table->text('no_kk_encrypted')->nullable(false)->change();
            $table->string('no_ktp_hash', 64)->nullable(false)->change();
        });

        // Re-add unique constraint
        DB::statement('ALTER TABLE warga ADD UNIQUE INDEX warga_no_ktp_hash_unique (no_ktp_hash)');
    }
};
