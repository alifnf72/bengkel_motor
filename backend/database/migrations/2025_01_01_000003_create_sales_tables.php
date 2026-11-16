<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $t) {
            $t->id();
            $t->string('invoice_no', 30)->nullable()->unique();
            $t->foreignId('kasir_id')->constrained('users');
            $t->unsignedBigInteger('subtotal')->default(0);
            $t->unsignedBigInteger('diskon')->default(0);
            $t->unsignedBigInteger('total')->default(0);
            $t->string('metode', 20);
            $t->unsignedBigInteger('dibayar')->default(0);
            $t->string('status', 20)->default('selesai'); // selesai | batal
            $t->timestamps();
            $t->index('created_at');
        });

        Schema::create('sale_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('sale_id')->constrained()->cascadeOnDelete();
            $t->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $t->string('nama', 150);
            $t->unsignedInteger('qty');
            $t->unsignedBigInteger('harga');
            $t->unsignedBigInteger('harga_beli')->default(0);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_items');
        Schema::dropIfExists('sales');
    }
};
