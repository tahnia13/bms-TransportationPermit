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
            if (!Schema::hasColumn('permits', 'approver')) {
                $table->string('approver')->nullable()->after('status');
            }
            if (!Schema::hasColumn('permits', 'approved_at')) {
                $table->dateTime('approved_at')->nullable()->after('approver');
            }
            if (!Schema::hasColumn('permits', 'approval_notes')) {
                $table->text('approval_notes')->nullable()->after('approved_at');
            }
            if (!Schema::hasColumn('permits', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approval_notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permits', function (Blueprint $table) {
            $table->dropColumn([
                'approver',
                'approved_at',
                'approval_notes',
                'rejection_reason',
            ]);
        });
    }
};
