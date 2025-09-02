<?php

namespace App\Http\Controllers\Shop;

use App\Exceptions\WafBlockedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\GetListItemsRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use App\Services\QueryParameterValidator;
use Illuminate\Database\Eloquent\Builder;

class GetListItemController extends Controller
{

    public function __invoke(GetListItemsRequest $request, QueryParameterValidator $validator)
    {
        try {
        $inputs = $request->all();
        $perPage = $validator->validate('per_page', $inputs['per_page'] ?? null, 10);
        $sortBy = $validator->validate('sort_by', $inputs['sort_by'] ?? null, 'created_at');
        $sortDir = $validator->validate('sort_dir', $inputs['sort_dir'] ?? null, 'desc');
        $search = $validator->validate('search', $inputs['search'] ?? null);
        $categoryId = $validator->validate('category_id', $inputs['category_id'] ?? null);

        $query = Item::query()->with('category');

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', function (Builder $cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        if ($sortBy === 'category_name') {
            $query->join('categories', 'items.category_id', '=', 'categories.id')
                ->orderByRaw("categories.name {$sortDir}")
                ->select('items.*');
        } else {
            $query->orderByRaw("{$sortBy} {$sortDir}");
        }

        $items = $query->paginate($perPage);

        return ItemResource::collection($items)
            ->additional([
                'status_code' => 200,
                'message' => 'Items retrieved successfully.'
            ]);

        } catch (WafBlockedException $e) {
            return response()->json([
                'status_code' => 403,
                'message' => 'WAF Blocked: Your request was identified as potentially malicious.',
                'blocked_by_pattern' => "/'|\"|--|#|\\bOR\\b|\\bAND\\b|\\bUNION\\b|\\bSELECT\\b|\\bINSERT\\b|\\bUPDATE\\b|\\bDELETE\\b|\\bDROP\\b/i"
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => 500,
                'message' => 'An error occurred while getting all items.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
