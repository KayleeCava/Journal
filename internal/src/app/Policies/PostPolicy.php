<?php

namespace App\Policies;

use App\Models\Topic;
use App\Models\User;

class PostPolicy
{
    public function createInTopic(?User $user, Topic $topic): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $allowedSlugs = ['thao-luan-chung', 'bao-loi-gop-y'];

        return in_array($topic->slug, $allowedSlugs);
    }
}
