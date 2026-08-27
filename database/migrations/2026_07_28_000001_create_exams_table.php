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
        Schema::create('ujian', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_mata_pelajaran')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->foreignUuid('id_kelas')->nullable()->constrained('kelas')->onDelete('cascade');
            $table->foreignUuid('id_guru')->constrained('guru')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->integer('durasi'); // in minutes
            $table->integer('nilai_kkm')->default(75);
            $table->boolean('acak_soal')->default(false);
            $table->boolean('acak_opsi')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('waktu_mulai')->nullable();
            $table->timestamp('waktu_selesai')->nullable();
            $table->timestamps();

            $table->index('id');
            $table->index('id_mata_pelajaran');
            $table->index('id_kelas');
            $table->index('id_guru');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ujian');
    }
};
