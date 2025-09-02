<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserPostDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'username' => $this->username,
            'bio' => $this->bio,
            'avatar' => $this->avatar_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($this->username) . '&background=random&color=fff',
        ];
    }
}
