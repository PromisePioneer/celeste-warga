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
            // Make no_kk and no_ktp_hash nullable
            // Note: unique constraint already exists from original migration, just change nullability
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
            $table->string('no_ktp_hash', 64)->nullable(false)->unique()->change();
        });
    }
};
