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
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'badge_number')) {
                $table->string('badge_number', 50)->nullable()->after('name')->index();
            }
            if (!Schema::hasColumn('drivers', 'position')) {
                $table->string('position', 100)->nullable()->after('badge_number');
            }
            if (!Schema::hasColumn('drivers', 'crew')) {
                $table->string('crew', 50)->nullable()->after('rig');
            }
            if (!Schema::hasColumn('drivers', 'nik_ktp')) {
                $table->string('nik_ktp', 50)->nullable()->after('license_type');
            }
            if (!Schema::hasColumn('drivers', 'blood_type')) {
                $table->string('blood_type', 10)->nullable()->after('nik_ktp');
            }
            if (!Schema::hasColumn('drivers', 'email')) {
                $table->string('email', 150)->nullable()->after('phone');
            }
            if (!Schema::hasColumn('drivers', 'address')) {
                $table->text('address')->nullable()->after('email');
            }
            if (!Schema::hasColumn('drivers', 'emergency_contact')) {
                $table->string('emergency_contact', 100)->nullable()->after('address');
            }
            if (!Schema::hasColumn('drivers', 'certification')) {
                $table->string('certification', 255)->nullable()->after('training_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $columns = [
                'badge_number',
                'position',
                'crew',
                'nik_ktp',
                'blood_type',
                'email',
                'address',
                'emergency_contact',
                'certification',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('drivers', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
