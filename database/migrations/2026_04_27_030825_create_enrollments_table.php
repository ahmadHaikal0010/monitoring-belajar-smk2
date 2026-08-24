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
        Schema::create('pendaftaran', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_siswa')->constrained('siswa')->onDelete('cascade');
            $table->foreignUuid('id_mata_pelajaran')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->enum('status', ['enrolled', 'completed', 'dropped'])->default('enrolled');
            $table->timestamp('terdaftar_pada')->useCurrent();
            $table->timestamps();

            $table->index('id');
            $table->index('id_siswa');
            $table->index('id_mata_pelajaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran');
    }
};
