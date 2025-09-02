<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class UserRankingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $icon_property = 'current_achievement_icon';

        return [
            'user_id' => $this->id,
            'rank' => $this->rank,
            'username' => $this->username,
            'email' => $this->email,
            'name' => $this->name,
            'score' => $this->score,
            'current_achievement' => $this->current_achievement,
            'icon' => $this->$icon_property
                ? Str::start($this->$icon_property, '/')
                : '/icons/unranked.png',
            'achieved_at' => $this->achieved_at,
        ];
    }
}
