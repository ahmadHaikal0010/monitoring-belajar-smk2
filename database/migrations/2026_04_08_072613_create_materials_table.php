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
        Schema::create('materi', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_mata_pelajaran')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->foreignUuid('id_kelas')->nullable()->constrained('kelas')->onDelete('cascade');
            $table->string('judul');
            $table->enum('tipe_konten', ['video', 'document', 'url']);
            $table->text('isi_konten')->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();

            $table->index('id');
            $table->index('id_mata_pelajaran');
            $table->index('id_kelas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materi');
    }
};
