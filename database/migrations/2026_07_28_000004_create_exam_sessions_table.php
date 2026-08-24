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
        Schema::create('sesi_ujian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_ujian')->constrained('ujian')->onDelete('cascade');
            $table->foreignUuid('id_siswa')->constrained('siswa')->onDelete('cascade');
            $table->timestamp('dimulai_pada');
            $table->timestamp('dikumpulkan_pada')->nullable();
            $table->float('total_skor')->nullable();
            $table->enum('status', ['in_progress', 'submitted', 'graded', 'timed_out'])->default('in_progress');
            $table->timestamps();

            $table->index('id');
            $table->index('id_ujian');
            $table->index('id_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesi_ujian');
    }
};
