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
        Schema::create('trips', function (Blueprint $table) {
            $table->id();

            // Relasi ke permit
            $table->foreignId('permit_id')
                ->nullable()
                ->constrained('permits')
                ->nullOnDelete();

            // Relasi ke vehicle
            $table->foreignId('vehicle_id')
                ->nullable()
                ->constrained('vehicles')
                ->nullOnDelete();

            // Relasi ke driver
            $table->foreignId('driver_id')
                ->nullable()
                ->constrained('drivers')
                ->nullOnDelete();

            // Informasi perjalanan
            $table->string('trip_number')->unique();
            $table->date('departure_date')->nullable();
            $table->date('return_date')->nullable();

            $table->string('origin')->nullable();
            $table->string('destination')->nullable();

            $table->string('purpose')->nullable();

            // Status perjalanan
            $table->string('status', 20)->default('Planned');

            // Catatan tambahan
            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};