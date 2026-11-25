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
        Schema::table('permits', function (Blueprint $table) {
            $table->string('position')->nullable()->after('driver');
            $table->string('license_number')->nullable()->after('position');
            $table->string('license_type')->nullable()->after('license_number');
            $table->string('license_expiry_year')->nullable()->after('license_type');
            $table->date('ddc_training_date')->nullable()->after('license_expiry_year');
            $table->string('equipment_type')->nullable()->default('FOCO / BUS / LV / 4 X 4')->after('ddc_training_date');
            $table->longText('driver_photo')->nullable()->after('equipment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            $table->dropColumn([
                'position',
                'license_number',
                'license_type',
                'license_expiry_year',
                'ddc_training_date',
                'equipment_type',
                'driver_photo',
            ]);
        });
    }
};
