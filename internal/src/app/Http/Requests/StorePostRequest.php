<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
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
            'title' => ['required', 'string', 'max:255', 'unique:posts,title'],
            'content' => ['required', 'string'],
            'topic_id' => ['required', 'integer', 'exists:topics,id'],
            'status' => ['required', Rule::in(['public', 'private'])],
        ];
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The title field is required.',
            'title.string'   => 'The title must be a string.',
            'title.max'      => 'The title may not be greater than 255 characters.',
            'title.unique'   => 'This title has already been taken.',

            'content.required' => 'The content field is required.',
            'content.string'   => 'The content must be a string.',

            'topic_id.required' => 'The topic_id field is required.',
            'topic_id.integer'  => 'The topic_id must be an integer.',
            'topic_id.exists'   => 'The selected topic does not exist.',

            'status.required' => 'The status field is required.',
            'status.in'       => 'The selected status is invalid. Must be "public" or "private".',
        ];
    }
}
