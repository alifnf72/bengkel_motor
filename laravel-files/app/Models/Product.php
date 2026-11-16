<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    protected $casts = ['is_jasa' => 'boolean', 'is_public' => 'boolean'];
}
