<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_settings', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 150);
            $table->string('tagline', 200);
            $table->string('alamat', 255);
            $table->string('jam', 180);
            $table->string('telp', 40);
            $table->string('wa', 40);
            $table->string('hero_badge', 180);
            $table->string('hero_judul', 200);
            $table->text('hero_deskripsi');
            $table->string('hero_image', 500)->nullable();
            $table->string('logo_image', 500)->nullable();
            $table->string('tentang_judul', 200);
            $table->json('highlights');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_settings');
    }
};
