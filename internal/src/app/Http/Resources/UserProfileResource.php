<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'user_id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'save_game' => $this->save_game,
            'role'  => $this->role,
            'gold'  => $this->gold,
            'score' => $this->score,
            'joined_at' => $this->created_at->toDateTimeString(),
            'bio' => $this->bio,
            'avatar_url' => $this->avatar_url,
            'achievement' => new AchievementResource($this->achievement),
            'answer_keys' => $this->whenLoaded('userAchievements', function () {
                return $this->userAchievements->pluck('achievement_id');
            }),
        ];
    }
}
