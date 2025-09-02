<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Post;

class StoreCommentController extends Controller
{
    public function __invoke(StoreCommentRequest $request, Post $post)
    {
        $user = $request->user();

        $canComment = false;

        if ($post->status === 'public') {
            $canComment = true;
        }

        if ($post->status === 'private' && $user->id === $post->user_id) {
            $canComment = true;
        }

        if (!$canComment) {
            return response()->json(['message' => 'You cannot comment on this post.'], 403);
        }

        try {
            $validated = $request->validated();

            $comment = new Comment();
            $comment->content = $validated['content'];
            $comment->user_id = $user->id;
            $comment->post_id = $post->id;

            if (isset($validated['parent_id'])) {
                $comment->parent_id = $validated['parent_id'];
            }

            $comment->save();

            $comment->load('user');

            return (new CommentResource($comment))
                ->additional(['message' => 'Comment posted successfully.'])
                ->response()
                ->setStatusCode(201);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while posting the comment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
