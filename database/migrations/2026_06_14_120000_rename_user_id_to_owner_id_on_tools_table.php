<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropIndex(['user_id', 'is_available']);
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->renameColumn('user_id', 'owner_id');
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->foreign('owner_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->index(['owner_id', 'is_available']);
        });
    }

    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropIndex(['owner_id', 'is_available']);
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->renameColumn('owner_id', 'user_id');
        });

        Schema::table('tools', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->index(['user_id', 'is_available']);
        });
    }
};
