<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class TogglePostLikeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request, Post $post)
    {
        $user = $request->user();

        $canLike = false;

        if ($post->status === 'public') {
            $canLike = true;
        }

        if ($post->status === 'private' && $user->id === $post->user_id) {
            $canLike = true;
        }

        if (!$canLike) {
            return response()->json(['message' => 'You cannot like this post.'], 403);
        }

        $like = $post->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            $post->likes()->create(['user_id' => $user->id]);
            $isLiked = true;
        }

        return response()->json([
            'status_code' => 200,
            'message' => $isLiked ? 'Post liked successfully.' : 'Post unliked successfully.',
            'data' => [
                'likes_count' => $post->likes()->count(),
                'is_liked' => $isLiked,
            ]
        ]);
    }
}
