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
        Schema::table('vehicles', function (Blueprint $table) {
            if (!Schema::hasColumn('vehicles', 'brand')) {
                $table->string('brand')->nullable()->after('type');
            }
            if (!Schema::hasColumn('vehicles', 'axle')) {
                $table->string('axle', 50)->nullable()->after('brand');
            }
            if (!Schema::hasColumn('vehicles', 'owner_name')) {
                $table->string('owner_name')->nullable()->after('axle');
            }
            if (!Schema::hasColumn('vehicles', 'color')) {
                $table->string('color', 100)->nullable()->after('year');
            }
            if (!Schema::hasColumn('vehicles', 'rig_baru')) {
                $table->string('rig_baru', 100)->nullable()->after('rig');
            }
            if (!Schema::hasColumn('vehicles', 'stnk_expiry')) {
                $table->date('stnk_expiry')->nullable()->after('rig_baru');
            }
            if (!Schema::hasColumn('vehicles', 'pajak_expiry')) {
                $table->date('pajak_expiry')->nullable()->after('stnk_expiry');
            }
            if (!Schema::hasColumn('vehicles', 'kir_expiry')) {
                $table->date('kir_expiry')->nullable()->after('pajak_expiry');
            }
            if (!Schema::hasColumn('vehicles', 'pass_expiry')) {
                $table->date('pass_expiry')->nullable()->after('kir_expiry');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'brand',
                'axle',
                'owner_name',
                'color',
                'rig_baru',
                'stnk_expiry',
                'pajak_expiry',
                'kir_expiry',
                'pass_expiry',
            ]);
        });
    }
};
