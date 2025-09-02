<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;


class GetListItemsRequest extends BasePaginationRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $baseRules = parent::rules();

        $itemRules = [
            'sort_by' => ['sometimes', 'string', Rule::in(['id', 'created_at', 'name', 'category_name', 'price'])],
            'sort_dir' => 'sometimes|string|max:300',
            'search' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:categories,id',
        ];

        return array_merge($baseRules, $itemRules);
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        $baseMessages = parent::messages();

        $itemMessages = [
            'sort_by.in' => 'Invalid sort value.',
            'sort_dir.in' => 'Invalid sort direction.',
            'search.string' => 'Search content must be a string.',
            'search.max' => 'Search content must not exceed 255 characters.',
            'category_id.integer' => 'Category ID must be an integer.',
            'category_id.exists' => 'The selected category ID does not exist.',
        ];

        return array_merge($baseMessages, $itemMessages);
    }
}
