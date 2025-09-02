<?php

use App\Http\Controllers\Community\CommunityIndexController;
use App\Http\Controllers\Community\PostDetailController;
use App\Http\Controllers\Login\LoginIndexController;
use App\Http\Controllers\Profile\ProfileIndexController;
use App\Http\Controllers\Ranking\RankingIndexController;
use App\Http\Controllers\Register\RegisterIndexController;
use App\Http\Controllers\Shop\ShopIndexController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', CommunityIndexController::class)->name('home');
Route::get('/login', LoginIndexController::class)->name('login.index');
Route::get('/register', RegisterIndexController::class)->name('register.index');
Route::get('/profile', ProfileIndexController::class)->name('profile.index');
Route::get('/shop', ShopIndexController::class)->name('shop.index');
Route::get('/ranking', RankingIndexController::class)->name('ranking.index');
Route::get('/ranking/{any?}', RankingIndexController::class)->where('any', '.*');
Route::get('/posts/{slug}', PostDetailController::class)->name('posts.show');
