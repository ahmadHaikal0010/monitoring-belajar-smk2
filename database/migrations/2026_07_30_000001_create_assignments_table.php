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
        Schema::create('assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignUuid('teacher_id')->constrained('teachers')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->integer('max_score')->default(100);
            $table->json('allowed_file_types')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('published');
            $table->timestamps();

            $table->index('id');
            $table->index('subject_id');
            $table->index('teacher_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
