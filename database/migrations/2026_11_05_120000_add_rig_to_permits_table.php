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
            if (!Schema::hasColumn('permits', 'rig')) {
                $table->string('rig', 100)->nullable()->after('vehicle');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            if (Schema::hasColumn('permits', 'rig')) {
                $table->dropColumn('rig');
            }
        });
    }
};
