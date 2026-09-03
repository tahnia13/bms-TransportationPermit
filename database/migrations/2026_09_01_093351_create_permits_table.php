<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('permits', function (Blueprint $table) {
            $table->id();

            $table->string('permit_number')->unique();

            $table->string('requester');

            $table->string('department')->nullable();

            $table->string('vehicle')->nullable();

            $table->string('driver')->nullable();

            $table->string('origin');

            $table->string('destination');

            $table->string('purpose');

            $table->date('start_date');

            $table->date('end_date');

            $table->enum('status', [
                'Approved',
                'Pending',
                'Rejected',
                'Active',
                'Expiring Soon',
                'Expired',
            ])->default('Pending');

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('permits');
    }
};