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
        Schema::create('assignment_submission_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('assignment_submission_id')->constrained('assignment_submissions')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->enum('file_type', ['image', 'pdf']);
            $table->integer('file_size')->nullable();
            $table->string('mime_type')->nullable();
            $table->timestamps();

            $table->index('assignment_submission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignment_submission_files');
    }
};
