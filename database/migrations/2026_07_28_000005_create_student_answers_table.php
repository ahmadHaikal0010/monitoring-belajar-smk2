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
        Schema::create('student_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_session_id')->constrained('exam_sessions')->onDelete('cascade');
            $table->foreignUuid('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignUuid('selected_option_id')->nullable()->constrained('options')->onDelete('cascade');
            $table->text('essay_answer')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->float('score_earned')->default(0.0);
            $table->timestamps();

            $table->index('id');
            $table->index('exam_session_id');
            $table->index('question_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_answers');
    }
};
