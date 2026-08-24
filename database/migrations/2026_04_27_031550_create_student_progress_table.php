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
        Schema::create('progres_siswa', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_pendaftaran')->constrained('pendaftaran')->onDelete('cascade');
            $table->foreignUuid('id_materi')->constrained('materi')->onDelete('cascade');
            $table->boolean('selesai')->default(false);
            $table->timestamp('diselesaikan_pada')->nullable();
            $table->timestamps();

            $table->index('id');
            $table->index('id_pendaftaran');
            $table->index('id_materi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progres_siswa');
    }
};
