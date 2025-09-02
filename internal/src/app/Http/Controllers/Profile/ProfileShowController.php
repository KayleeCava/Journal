<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfileResource;
use Illuminate\Http\Request;

class ProfileShowController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(Request $request)
    {
        $user = $request->user()->load(['achievement', 'userAchievements']);

        return response()->json([
            'status_code' => 200,
            'data' => new UserProfileResource($user)
        ], 200);
    }
}

