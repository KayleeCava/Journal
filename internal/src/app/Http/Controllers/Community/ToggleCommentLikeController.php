<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class ToggleCommentLikeController extends Controller
{
    public function __invoke(Request $request, Comment $comment)
    {
        $user = $request->user();

        $post = $comment->post;

        if ($post->status !== 'public') {
            if ($user->id !== $post->user_id) {
                return response()->json([
                    'message' => 'You cannot like comments on this post.'
                ], 403);
            }
        }

        $like = $comment->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            $comment->likes()->create(['user_id' => $user->id]);
            $isLiked = true;
        }

        return response()->json([
            'status_code' => 200,
            'message' => $isLiked ? 'Comment liked successfully.' : 'Comment unliked successfully.',
            'data' => [
                'likes_count' => $comment->likes()->count(),
                'is_liked' => $isLiked,
            ]
        ]);
    }
}
