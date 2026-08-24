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
        Schema::create('opsi_jawaban', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('id_soal')->constrained('soal')->onDelete('cascade');
            $table->text('teks_opsi');
            $table->boolean('benar')->default(false);
            $table->integer('urutan')->default(0);
            $table->timestamps();

            $table->index('id');
            $table->index('id_soal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opsi_jawaban');
    }
};
