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
        Schema::create('guru', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('id_pengguna')->constrained('pengguna')->onDelete('cascade');
            $table->string('nip', 18)->unique();
            $table->string('foto')->nullable();
            $table->string('bio')->nullable();
            $table->string('spesialisasi')->nullable();
            $table->timestamps();

            $table->index('id');
            $table->index('id_pengguna');
            $table->index('nip');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guru');
    }
};
