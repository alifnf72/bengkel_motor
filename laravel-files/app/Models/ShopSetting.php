<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShopSetting extends Model
{
    protected $table = 'shop_settings';

    protected $guarded = [];

    protected $casts = ['highlights' => 'array'];

    public static function current(): self
    {
        return static::query()->firstOrCreate(['id' => 1], [
            'nama' => 'Bengkel Motor Akay',
            'tagline' => 'Motor sehat, perjalanan tenang.',
            'alamat' => 'Jl. Langkaplancar - Lakbok No.122, Neglasari, Kec. Pamarican, Kabupaten Ciamis, Jawa Barat 46382',
            'jam' => 'Senin-Sabtu 08.00-17.00, Minggu tutup',
            'telp' => '0821-1761-7859',
            'wa' => '6282117617859',
            'hero_badge' => 'Bengkel terpercaya sejak 2012',
            'hero_judul' => 'Motor sehat, perjalanan tenang.',
            'hero_deskripsi' => 'Sparepart pilihan untuk motor harian, harga transparan, dan bantuan memilih komponen yang tepat untuk perjalanan Anda.',
            'hero_image' => '/images/hero-bengkel.png',
            'logo_image' => '/images/logo-akai.png',
            'tentang_judul' => 'Onderdil yang tepat bikin perjalanan lebih tenang.',
            'highlights' => [
                ['no' => '01', 'title' => 'Pilihan onderdil', 'desc' => 'Tersedia oli, ban, rem, aki, busi, filter, rantai, dan lampu.'],
                ['no' => '02', 'title' => 'Bantuan memilih', 'desc' => 'Kami bantu mencocokkan komponen dengan tipe dan kebutuhan motor Anda.'],
                ['no' => '03', 'title' => 'Harga jelas', 'desc' => 'Informasi harga dan ketersediaan barang bisa ditanyakan sebelum membeli.'],
            ],
        ]);
    }

    public function profileArray(): array
    {
        $data = $this->makeHidden(['hero_image_path', 'logo_image_path'])->toArray();
        $version = $this->updated_at?->timestamp ?? time();
        $data['hero_image'] = $this->hero_image_path
            ? url('/api/public/shop-image/hero').'?v='.$version
            : $this->hero_image;
        $data['logo_image'] = $this->logo_image_path
            ? url('/api/public/shop-image/logo').'?v='.$version
            : $this->logo_image;

        return $data;
    }
}
