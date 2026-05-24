<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
 {
     Schema::create('foods', function (Blueprint $table) {
        $table->id();
        $table->foreignId('vendor_id')->constrained('users');
        $table->string('name');
        $table->string('category');
        $table->decimal('price', 8, 2);
        $table->boolean('track_stock')->default(false);
        $table->integer('stock_qty')->default(0);
        $table->boolean('is_available')->default(true);
        $table->string('image')->nullable();
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('foods');
    }
};
