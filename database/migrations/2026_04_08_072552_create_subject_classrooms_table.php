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
        Schema::create('kelas_mata_pelajaran', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_mata_pelajaran')->constrained('mata_pelajaran')->onDelete('cascade');
            $table->foreignUuid('id_kelas')->constrained('kelas')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['id_mata_pelajaran', 'id_kelas']);
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
        Schema::dropIfExists('kelas_mata_pelajaran');
    }
};
