<?php

use App\Http\Controllers\{Auth\AuthLoginController,
    Auth\AuthLogoutController,
    Auth\RegisterController,
    Community\GetListPostController,
    Community\GetListTopicController,
    Community\GetPostDetailController,
    Community\StoreCommentController,
    Community\StorePostController,
    Community\ToggleCommentLikeController,
    Community\TogglePostLikeController,
    Flag\GetFlagController,
    Image\GetImageController,
    Profile\GetInventoryController,
    Profile\ProfileShowController,
    Profile\UpdateProfileController,
    Ranking\GetListAchievementController,
    Ranking\GetRankingDetailController,
    Ranking\RankingAchievementsController,
    Ranking\SubmitAnswerController,
    SaveGame\SaveGameController,
    Shop\AddToCartController,
    Shop\CheckoutController,
    Shop\GetCartController,
    Shop\GetListCategoryController,
    Shop\GetListItemController,
    Shop\RemoveItemsFromCartController};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/login', AuthLoginController::class);
Route::post('/register', RegisterController::class);
Route::get('/achievements', GetListAchievementController::class);
Route::get('/achievements/ranking', RankingAchievementsController::class);
Route::get('/achievements/ranking/{userId}', GetRankingDetailController::class)->where('userId', '[0-9]+');
Route::get('/categories', GetListCategoryController::class);
Route::get('/items', GetListItemController::class);
Route::get('/topics', GetListTopicController::class);
Route::get('/posts/{post:slug}', GetPostDetailController::class);
Route::get('/posts', GetListPostController::class);
Route::get('/images/{name}', GetImageController::class)
    ->where('name', '.*');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', AuthLogoutController::class);
    Route::get('/profile', ProfileShowController::class);
    Route::patch('/profile', UpdateProfileController::class);
    Route::post('/submit-answer', SubmitAnswerController::class);
    Route::post('/cart', AddToCartController::class);
    Route::get('/cart', GetCartController::class);
    Route::delete('/cart/items', RemoveItemsFromCartController::class);
    Route::post('/cart/checkout', CheckoutController::class);
    Route::get('/inventory', GetInventoryController::class);
    Route::post('/posts', StorePostController::class);
    Route::post('/posts/{post}/comments', StoreCommentController::class);
    Route::post('/posts/{post}/like', TogglePostLikeController::class);
    Route::post('/comments/{comment}/like', ToggleCommentLikeController::class);
    Route::post('/save-game', SaveGameController::class);
    Route::get('/flag', GetFlagController::class)->middleware('role.admin');
});
