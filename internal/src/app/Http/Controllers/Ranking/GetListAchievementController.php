<?php

namespace App\Http\Controllers\Ranking;

use App\Http\Controllers\Controller;
use App\Http\Resources\AchievementResource;
use App\Models\Achievement;
use Illuminate\Http\Request;

class GetListAchievementController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(Request $request)
    {
        return response()->json([
            'data' => AchievementResource::collection(Achievement::all())
        ]);
    }
}
