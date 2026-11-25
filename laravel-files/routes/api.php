<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\ShopSettingController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

// Publik (tanpa login)
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::get('/public/products', [PublicController::class, 'products']);
Route::get('/public/products/{product}/image', [PublicController::class, 'image']);
Route::get('/public/shop', [PublicController::class, 'shop']);
Route::get('/public/shop-image/{kind}', [PublicController::class, 'shopImage']);

// Wajib login (token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}/image', [ProductController::class, 'image']);

    Route::middleware(EnsureRole::class . ':admin,gudang')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/{product}/stock', [ProductController::class, 'addStock']);
    });

    Route::post('/sales', [SaleController::class, 'store'])->middleware(EnsureRole::class . ':admin,kasir');
    Route::get('/reports/today', [ReportController::class, 'today'])->middleware(EnsureRole::class . ':admin');
    Route::get('/reports/range', [ReportController::class, 'range'])->middleware(EnsureRole::class . ':admin');
    Route::get('/reports/sales-trend', [ReportController::class, 'trend'])->middleware(EnsureRole::class . ':admin');
    Route::get('/reports/history', [ReportController::class, 'history'])->middleware(EnsureRole::class . ':admin');
    Route::get('/shop-settings', [ShopSettingController::class, 'show'])->middleware(EnsureRole::class . ':admin');
    Route::put('/shop-settings', [ShopSettingController::class, 'update'])->middleware(EnsureRole::class . ':admin');
});
