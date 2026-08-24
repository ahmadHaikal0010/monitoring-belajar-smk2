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
        Schema::create('tugas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_mata_pelajaran')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->foreignUuid('id_guru')->constrained('guru')->onDelete('cascade');
            $table->string('judul');
            $table->text('deskripsi')->nullable();
            $table->timestamp('tenggat_waktu')->nullable();
            $table->integer('skor_maksimal')->default(100);
            $table->json('tipe_berkas_diizinkan')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('published');
            $table->timestamps();

            $table->index('id');
            $table->index('id_mata_pelajaran');
            $table->index('id_guru');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas');
    }
};
