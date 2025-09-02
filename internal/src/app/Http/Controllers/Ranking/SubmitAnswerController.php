<?php

namespace App\Http\Controllers\Ranking;

use App\Http\Controllers\Controller;
use App\Http\Requests\RequestSubmit;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SubmitAnswerController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param RequestSubmit $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(RequestSubmit $request)
    {
        $user = Auth::user();
        $rawAnswerKey = $request->input('answer_key');

        $correctAchievement = null;
        foreach (Achievement::whereNotNull('answer_key')->cursor() as $achievement) {
            if (Hash::check($rawAnswerKey, $achievement->answer_key)) {
                $correctAchievement = $achievement;
                break;
            }
        }

        if (!$correctAchievement) {
            return response()->json(['message' => 'Invalid answer key.'], 400);
        }

        $hasSubmitted = UserAchievement::where('user_id', $user->id)
            ->where('achievement_id', $correctAchievement->id)
            ->exists();

        if ($hasSubmitted) {
            return response()->json(['message' => 'You have already achieved this.'], 409);
        }

        DB::beginTransaction();
        try {
            $user->score += 1;
            $user->gold += 50;
            $user->save();

            $newTier = Achievement::where('required_score', '<=', $user->score)
                ->orderByDesc('required_score')
                ->first();

            if ($newTier) {
                $user->achievement_id = $newTier->id;
            }

            UserAchievement::create([
                'user_id' => $user->id,
                'achievement_id' => $correctAchievement->id,
                'answer_key' => $correctAchievement->answer_key,
            ]);

            $user->save();
            DB::commit();

            return response()->json([
                'status_code' => 200,
                'data' => [
                    'message' => 'Correct answer! You have earned 50 Gold and leveled up to: ' . $newTier->name . '.',
                    'new_score' => $user->score,
                    'current_tier' => $newTier->name ?? 'Unranked',
                    'gold_awarded' => 50,
                    'new_gold_total' => $user->gold,
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while submitting the answer.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
