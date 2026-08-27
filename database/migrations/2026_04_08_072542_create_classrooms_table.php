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
        Schema::create('kelas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_jurusan')->constrained('jurusan')->onDelete('cascade');
            $table->foreignUuid('id_wali_kelas')->nullable()->constrained('guru')->onDelete('set null');
            $table->enum('tingkat', ['10', '11', '12']);
            $table->string('rombel', 5);
            $table->string('nama_kelas');
            $table->string('tahun_ajaran', 9);
            $table->timestamps();

            $table->unique(['id_jurusan', 'tingkat', 'rombel', 'tahun_ajaran']);
            $table->index('id');
            $table->index('id_jurusan');
            $table->index('id_wali_kelas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
