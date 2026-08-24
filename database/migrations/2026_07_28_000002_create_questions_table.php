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
        Schema::create('soal', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_ujian')->constrained('ujian')->onDelete('cascade');
            $table->foreignUuid('id_materi')->nullable()->constrained('materi')->nullOnDelete();
            $table->text('teks_soal');
            $table->enum('tipe_soal', ['multiple_choice', 'essay'])->default('multiple_choice');
            $table->string('jalur_gambar')->nullable();
            $table->float('bobot_skor')->default(1.0);
            $table->integer('urutan')->default(0);
            $table->timestamps();

            $table->index('id');
            $table->index('id_ujian');
            $table->index('id_materi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('soal');
    }
};
