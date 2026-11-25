<?php

namespace App\Http\Controllers;

use App\Models\ShopSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShopSettingController extends Controller
{
    public function show()
    {
        return ShopSetting::current()->profileArray();
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:150',
            'tagline' => 'required|string|max:200',
            'alamat' => 'required|string|max:255',
            'jam' => 'required|string|max:180',
            'telp' => 'required|string|max:40',
            'wa' => 'required|string|max:40',
            'hero_badge' => 'required|string|max:180',
            'hero_judul' => 'required|string|max:200',
            'hero_deskripsi' => 'required|string|max:2000',
            'hero_upload' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'logo_upload' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
            'remove_hero_image' => 'nullable|boolean',
            'remove_logo_image' => 'nullable|boolean',
            'tentang_judul' => 'required|string|max:200',
            'highlights' => 'required|array|size:3',
            'highlights.*.no' => 'required|string|max:4',
            'highlights.*.title' => 'required|string|max:100',
            'highlights.*.desc' => 'required|string|max:500',
        ]);

        $shop = ShopSetting::current();
        $heroUpload = $request->file('hero_upload');
        $logoUpload = $request->file('logo_upload');
        $removeHero = $request->boolean('remove_hero_image');
        $removeLogo = $request->boolean('remove_logo_image');
        unset($data['hero_upload'], $data['logo_upload'], $data['remove_hero_image'], $data['remove_logo_image']);

        $stored = [];
        try {
            if ($heroUpload) {
                $stored['hero'] = $heroUpload->store('shop', 'local');
                $data['hero_image_path'] = $stored['hero'];
            } elseif ($removeHero) {
                $data['hero_image_path'] = null;
                $data['hero_image'] = '/images/hero-bengkel.png';
            }
            if ($logoUpload) {
                $stored['logo'] = $logoUpload->store('shop', 'local');
                $data['logo_image_path'] = $stored['logo'];
            } elseif ($removeLogo) {
                $data['logo_image_path'] = null;
                $data['logo_image'] = '/images/logo-akai.png';
            }

            $oldHero = $shop->hero_image_path;
            $oldLogo = $shop->logo_image_path;
            $shop->update($data);
            if (($heroUpload || $removeHero) && $oldHero) Storage::disk('local')->delete($oldHero);
            if (($logoUpload || $removeLogo) && $oldLogo) Storage::disk('local')->delete($oldLogo);

            return $shop->fresh()->profileArray();
        } catch (\Throwable $error) {
            foreach ($stored as $path) Storage::disk('local')->delete($path);
            throw $error;
        }
    }
}
