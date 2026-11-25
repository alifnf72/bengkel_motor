<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ShopSetting;
use Illuminate\Support\Facades\Storage;

class PublicController extends Controller
{
    public function shop()
    {
        return ShopSetting::current()->profileArray();
    }

    public function shopImage(string $kind)
    {
        abort_unless(in_array($kind, ['hero', 'logo'], true), 404);
        $shop = ShopSetting::current();
        $path = $kind === 'hero' ? $shop->hero_image_path : $shop->logo_image_path;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }

    // Katalog publik: tidak pernah menyertakan harga beli.
    public function products()
    {
        return Product::where('is_public', true)->orderBy('nama')->get()->map(fn ($p) => [
            'id' => $p->id,
            'nama' => $p->nama,
            'kategori' => $p->kategori,
            'harga_jual' => $p->harga_jual,
            'is_jasa' => $p->is_jasa,
            'tersedia' => $p->is_jasa || $p->stok > 0,
            'gambar_url' => $p->gambar_path ? url('/api/public/products/'.$p->id.'/image').'?v='.$p->updated_at->timestamp : null,
        ]);
    }

    public function image(Product $product)
    {
        abort_unless($product->is_public && $product->gambar_path && Storage::disk('local')->exists($product->gambar_path), 404);
        return Storage::disk('local')->response($product->gambar_path);
    }
}
