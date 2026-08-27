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
        Schema::create('anggota_kelas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_kelas')->constrained('kelas')->onDelete('cascade');
            $table->foreignUuid('id_siswa')->constrained('siswa')->onDelete('cascade');
            $table->enum('status', ['aktif', 'pindah', 'lulus'])->default('aktif');
            $table->timestamps();

            $table->unique(['id_kelas', 'id_siswa']);
            $table->index('id');
            $table->index('id_kelas');
            $table->index('id_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anggota_kelas');
    }
};
