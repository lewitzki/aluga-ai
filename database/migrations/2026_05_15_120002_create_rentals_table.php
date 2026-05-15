<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tool_id')->constrained()->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('expected_ends_at');
            $table->timestamp('ended_at')->nullable();
            $table->string('status');
            $table->decimal('hourly_rate_snapshot', 10, 2);
            $table->decimal('estimated_total', 12, 2)->nullable();
            $table->decimal('final_total', 12, 2)->nullable();
            $table->timestamps();

            $table->index('client_id');
            $table->index('status');
            $table->index(['tool_id', 'starts_at', 'expected_ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
