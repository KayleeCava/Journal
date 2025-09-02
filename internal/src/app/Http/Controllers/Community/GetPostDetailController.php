<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostDetailResource;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GetPostDetailController extends Controller
{
    public function __invoke(Request $request, Post $post)
    {
        $user = Auth::guard('sanctum')->user();

        try {
            $post->load([
                'user:id,username,bio,avatar_url',
                'topic:id,title',
                'rootComments' => function ($query) {
                    $query->with('allReplies')
                        ->orderBy('created_at', 'desc');
                }
            ]);

            $post->loadCount(['likes', 'allComments as comments_count']);

            if ($user) {
                $post->loadExists(['likes as is_liked' => fn($q) => $q->where('user_id', $user->id)]);

                $loadIsLikedRecursive = function ($comments) use ($user, &$loadIsLikedRecursive) {
                    if ($comments->isEmpty()) {
                        return;
                    }

                    $comments->loadExists(['likes as is_liked' => fn($q) => $q->where('user_id', $user->id)]);

                    foreach ($comments as $comment) {
                        $loadIsLikedRecursive($comment->replies);
                    }
                };

                $loadIsLikedRecursive($post->rootComments);

            } else {
                $post->is_liked = false;
            }

            $relatedPosts = Post::where('topic_id', $post->topic_id)
                ->where('id', '!=', $post->id)
                ->where('status', 'public')
                ->select('id', 'title', 'slug')
                ->latest()
                ->limit(5)
                ->get();

            return (new PostDetailResource($post))
                ->additional([
                    'status_code' => 200,
                    'message' => 'Post retrieved successfully.',
                    'meta' => [
                        'related_posts' => $relatedPosts
                    ]
                ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while retrieving the post.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
