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
        Schema::create('jawaban_siswa', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_sesi_ujian')->constrained('sesi_ujian')->onDelete('cascade');
            $table->foreignUuid('id_soal')->constrained('soal')->onDelete('cascade');
            $table->foreignUuid('id_opsi_dipilih')->nullable()->constrained('opsi_jawaban')->onDelete('cascade');
            $table->text('jawaban_esai')->nullable();
            $table->boolean('benar')->nullable();
            $table->float('skor_diperoleh')->default(0.0);
            $table->timestamps();

            $table->index('id');
            $table->index('id_sesi_ujian');
            $table->index('id_soal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jawaban_siswa');
    }
};
