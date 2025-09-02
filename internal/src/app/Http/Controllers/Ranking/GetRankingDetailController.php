<?php

namespace App\Http\Controllers\Ranking;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserRankingResource;
use App\Models\Achievement;
use App\Models\User;
use Illuminate\Support\Facades\Cache; // Thêm Cache Facade để tối ưu

class GetRankingDetailController extends Controller
{
    /**
     * SỬA LẠI HOÀN TOÀN HÀM NÀY
     * Tính toán rank tuyệt đối, sử dụng whereHas cho tất cả các điều kiện liên quan đến count.
     */
    private function calculateAbsoluteRank(User $user): int
    {
        $rank = User::where(function ($query) use ($user) {
            $query->whereHas('achieved', null, '>', $user->achieved_count)
                ->orWhere(function ($subQuery) use ($user) {
                    $subQuery->whereHas('achieved', null, '=', $user->achieved_count)
                        ->where('score', '>', $user->score);
                })
                ->orWhere(function ($subQuery) use ($user) {
                    $subQuery->whereHas('achieved', null, '=', $user->achieved_count)
                        ->where('score', '=', $user->score)
                        ->where('created_at', '<', $user->created_at);
                })
                ->orWhere(function ($subQuery) use ($user) {
                    $subQuery->whereHas('achieved', null, '=', $user->achieved_count)
                        ->where('score', '=', $user->score)
                        ->where('created_at', '=', $user->created_at)
                        ->where('id', '<', $user->id);
                });
        })->count();
        return $rank + 1;
    }

    private function addUserRankingDetails(User $user): void
    {
        $achievements = Cache::remember('all_achievements_sorted', now()->addMinutes(60), function () {
            return Achievement::orderByDesc('required_score')->get();
        });

        $currentAchievement = $achievements->first(fn ($achievement) => $user->score >= $achievement->required_score);

        $user->current_achievement = $currentAchievement ? $currentAchievement->name : 'Unranked';
        $user->current_achievement_icon = $currentAchievement ? $currentAchievement->icon : 'icons/unranked.png';

        $achievedAt = null;
        if ($currentAchievement) {
            $pivot = $user->achieved->firstWhere('id', $currentAchievement->id);
            $achievedAt = $pivot ? $pivot->pivot->achieved_at : null;
        }
        if (!$achievedAt) {
            $achievedAt = $user->created_at?->toDateTimeString();
        }
        $user->achieved_at = $achievedAt;
    }

    public function __invoke($userId)
    {
        try {
            $user = User::with(['achieved' => function ($q) {
                $q->orderBy('required_score', 'desc');
            }])
                ->withCount('achieved')
                ->find($userId);

            if (!$user) {
                return response()->json([
                    'status_code' => 404,
                    'message' => 'User not found.'
                ], 404);
            }

            $this->addUserRankingDetails($user);

            // Gọi hàm tính rank mới, đáng tin cậy
            $user->rank = $this->calculateAbsoluteRank($user);

            return (new UserRankingResource($user))
                ->additional(['status_code' => 200])
                ->response();

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An unexpected error occurred while fetching the user ranking detail.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
