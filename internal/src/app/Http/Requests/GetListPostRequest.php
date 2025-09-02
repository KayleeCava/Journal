<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GetListPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Anyone can view the list of public posts
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'search' => 'nullable|string|max:255',
            'topic_id' => 'nullable|integer|exists:topics,id',
            'sort_by' => ['sometimes', 'string', Rule::in(['created_at', 'title', 'likes_count', 'comments_count'])],
            'sort_dir' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => 'nullable|integer|min:1|max:100',
            'page' => 'nullable|integer|min:1',
            'filter' => [
                'nullable',
                'string',
                Rule::in(['my_posts']),
            ],
            'status' => [
                'nullable',
                'string',
                Rule::in(['public', 'private']),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'search.string' => 'The search term must be a string.',
            'search.max' => 'The search term may not be greater than 255 characters.',
            'topic_id.integer' => 'The topic ID must be an integer.',
            'topic_id.exists' => 'The selected topic ID does not exist.',
            'sort_by.in' => 'The sort by value is invalid. Accepted values are: created_at, title, likes_count, comments_count.',
            'sort_dir.in' => 'The sort direction is invalid. Only "asc" or "desc" are accepted.',
            'per_page.integer' => 'The per page value must be an integer.',
            'per_page.min' => 'The per page value must be at least 1.',
            'filter.in' => 'The selected filter is invalid.',
            'status.in' => 'The status filter is invalid. Accepted values are: public, private.',
        ];
    }
}
