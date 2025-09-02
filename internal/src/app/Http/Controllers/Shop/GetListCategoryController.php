<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class GetListCategoryController extends Controller
{
    /**
     * Handle the incoming request.
     *
     * @param Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\JsonResponse
     */
    public function __invoke(Request $request)
    {
        try {
            $categories = Category::all();

            return response()->json([
                'status_code' => 200,
                'data' => CategoryResource::collection($categories)
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while getting all categories.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
