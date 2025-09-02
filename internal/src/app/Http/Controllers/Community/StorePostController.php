<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Models\Topic;
use Illuminate\Support\Str;

class StorePostController extends Controller
{
    public function __invoke(StorePostRequest $request)
    {
        try {
            $validated = $request->validated();
            $user = $request->user();

            $topic = Topic::findOrFail($validated['topic_id']);

            if ($user->cannot('createInTopic', [Post::class, $topic])) {
                return response()->json([
                    'status_code' => 403,
                    'message' => 'You do not have permission to post in this topic.'
                ], 403);
            }

            $post = new Post();
            $post->user_id = auth()->id();
            $post->topic_id = $validated['topic_id'];
            $post->title = $validated['title'];
            $post->slug = Str::slug($validated['title']);
            $post->content = $validated['content'];
            $post->status = $validated['status'];
            $post->save();

            $post->load('user', 'topic');

            return response()->json([
                'status_code' => 201,
                'message' => 'Post created successfully.',
                'data' => new PostResource($post)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while creating the post.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
