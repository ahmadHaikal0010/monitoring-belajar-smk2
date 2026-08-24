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
        Schema::create('berkas_pengumpulan_tugas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_pengumpulan_tugas')->constrained('pengumpulan_tugas')->onDelete('cascade');
            $table->string('jalur_berkas');
            $table->string('nama_berkas');
            $table->enum('tipe_berkas', ['image', 'pdf']);
            $table->integer('ukuran_berkas')->nullable();
            $table->string('tipe_mime')->nullable();
            $table->timestamps();

            $table->index('id_pengumpulan_tugas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('berkas_pengumpulan_tugas');
    }
};
