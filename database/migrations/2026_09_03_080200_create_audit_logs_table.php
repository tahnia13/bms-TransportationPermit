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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('user_name')->default('Admin');
            $table->string('user_role')->default('Transportation Admin');
            $table->string('action'); // CREATE, UPDATE, DELETE, APPROVE, REJECT, UPLOAD, DOWNLOAD, EMAIL, EXPORT
            $table->string('module'); // Permit, Vehicle, Driver, Trip, Archive, Report
            $table->string('entity_id')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
