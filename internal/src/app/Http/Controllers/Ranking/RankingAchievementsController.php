<?php

namespace App\Http\Controllers\Ranking;

use App\Http\Controllers\Controller;
use App\Http\Requests\BasePaginationRequest;
use App\Http\Resources\UserRankingResource;
use App\Models\Achievement;
use App\Models\User;

class RankingAchievementsController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param BasePaginationRequest $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(BasePaginationRequest $request)
    {
        try {
            $perPage = $request->input('per_page', 10);

            $achievements = Achievement::orderByDesc('required_score')->get();

            $users = User::with(['achieved' => function ($q) {
                $q->orderBy('required_score', 'desc');
            }])
                ->withCount('achieved')
                ->orderByDesc('achieved_count')
                ->orderByDesc('score')
                ->orderBy('created_at', 'asc')
                ->orderBy('id', 'asc')
                ->paginate($perPage);

            $currentPage = $users->currentPage();
            $perPage = $users->perPage();

            $users->getCollection()->transform(function ($user, $index) use ($achievements, $currentPage, $perPage) {
                $currentAchievement = $achievements->first(function ($achievement) use ($user) {
                    return $user->score >= $achievement->required_score;
                });

                $currentAchievementName = $currentAchievement ? $currentAchievement->name : 'Unranked';
                $currentAchievementIcon = $currentAchievement ? $currentAchievement->icon : null;

                $achievedAt = null;
                if ($currentAchievement) {
                    $pivot = $user->achieved->firstWhere('id', $currentAchievement->id);
                    $achievedAt = $pivot ? $pivot->pivot->achieved_at : null;
                }
                if (!$achievedAt) {
                    $achievedAt = $user->created_at ? $user->created_at->toDateTimeString() : null;
                }

                $user->rank = ($currentPage - 1) * $perPage + $index + 1;
                $user->current_achievement = $currentAchievementName;
                $user->current_achievement_icon = $currentAchievementIcon;
                $user->achieved_at = $achievedAt;

                return $user;
            });

            return UserRankingResource::collection($users)
                ->additional(['status_code' => 200]);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An unexpected error occurred while fetching the rankings.'
            ], 500);
        }
    }
}
