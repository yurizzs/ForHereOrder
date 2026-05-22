<?php

use App\Http\Controllers\API\v1\AuthenticationController;
use App\Http\Controllers\API\v1\UserController;
use App\Http\Controllers\API\v1\FoodController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthenticationController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('user/auth/me', [AuthenticationController::class, 'me']);
    Route::post('auth/logout', [AuthenticationController::class, 'logout']);
    Route::post('profile', [UserController::class, 'updateProfile']);

    // Admin Only
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/restore', [UserController::class, 'restore']);
    });

    // Vendor/Auth Access
    Route::apiResource('foodservices', FoodController::class);
    Route::get('orders/settlement', [OrderController::class, 'settlement']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'update', 'show']);
});
