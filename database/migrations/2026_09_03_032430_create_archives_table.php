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
        Schema::create('archives', function (Blueprint $table) {
            $table->id();

            $table->string('document_number')->unique();

            $table->string('title');

            $table->string('category');

            $table->string('uploaded_by')->nullable();

            $table->date('archive_date')->nullable();

            $table->enum('status', [
                'Active',
                'Pending',
                'Archived',
            ])->default('Active');

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archives');
    }
};