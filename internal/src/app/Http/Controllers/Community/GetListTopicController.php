<?php

namespace App\Http\Controllers\Community;

use App\Http\Controllers\Controller;
use App\Http\Resources\TopicResource;
use App\Models\Topic;
use Illuminate\Http\Request;

class GetListTopicController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $topics = Topic::all();

            return response()->json([
                'status_code' => 200,
                'data' => TopicResource::collection($topics)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while getting all topics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
