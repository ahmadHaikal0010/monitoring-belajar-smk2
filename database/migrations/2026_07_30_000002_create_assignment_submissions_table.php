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
        Schema::create('pengumpulan_tugas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_tugas')->constrained('tugas')->onDelete('cascade');
            $table->foreignUuid('id_siswa')->constrained('siswa')->onDelete('cascade');
            $table->timestamp('dikumpulkan_pada');
            $table->text('catatan')->nullable();
            $table->float('skor')->nullable();
            $table->text('umpan_balik')->nullable();
            $table->enum('status', ['submitted', 'graded', 'late', 'returned'])->default('submitted');
            $table->timestamps();

            $table->unique(['id_tugas', 'id_siswa']);
            $table->index('id_tugas');
            $table->index('id_siswa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengumpulan_tugas');
    }
};
