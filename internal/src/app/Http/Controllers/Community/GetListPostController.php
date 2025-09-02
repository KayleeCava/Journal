<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Http\Requests\GetListPostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class GetListPostController extends Controller
{
    public function __invoke(GetListPostRequest $request)
    {
        try {
            $validated = $request->validated();

            $perPage = $validated['per_page'] ?? 10;
            $sortBy = $validated['sort_by'] ?? 'created_at';
            $sortDir = $validated['sort_dir'] ?? 'desc';

            $query = Post::query()
                ->with([
                    'user:id,username,email',
                    'topic:id,title,slug'
                ])
                ->withCount(['likes', 'allComments as comments_count']);

            $user = Auth::guard('sanctum')->user();

            if ($request->query('filter') === 'my_posts' && $user) {
                $query->where('user_id', $user->id);
            } else {
                $query->when($validated['status'] ?? 'public', function ($q, $status) {
                    $q->where('status', $status);
                });
            }

            $query->when(isset($validated['search']), function ($q) use ($validated) {
                $searchTerm = '%' . $validated['search'] . '%';
                $q->where(function ($subQuery) use ($searchTerm) {
                    $subQuery->where('title', 'like', $searchTerm)
                        ->orWhere('content', 'like', 'searchTerm');
                });
            });

            $query->when(isset($validated['topic_id']), function ($q) use ($validated) {
                $q->where('topic_id', $validated['topic_id']);
            });

            $query->orderBy($sortBy, $sortDir);

            $posts = $query->paginate($perPage);

            return PostResource::collection($posts)->additional([
                'status_code' => 200,
                'message' => 'Posts retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while retrieving posts.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
