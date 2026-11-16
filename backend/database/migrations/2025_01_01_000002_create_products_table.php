<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->string('sku', 50)->unique();
            $t->string('barcode', 50)->nullable()->unique();
            $t->string('nama', 150);
            $t->string('kategori', 50)->default('Lainnya');
            $t->unsignedBigInteger('harga_beli')->default(0);
            $t->unsignedBigInteger('harga_jual');
            $t->integer('stok')->default(0);
            $t->integer('stok_min')->default(0);
            $t->boolean('is_jasa')->default(false);   // jasa servis: tanpa stok
            $t->boolean('is_public')->default(true);  // tampil di katalog publik
            $t->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $t) {
            $t->id();
            $t->foreignId('product_id')->constrained()->cascadeOnDelete();
            $t->integer('perubahan');
            $t->string('alasan', 100);
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('products');
    }
};
