<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RemoveItemsFromCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'cart_item_ids'   => 'required|array',
            'cart_item_ids.*' => 'required|integer|exists:cart_items,id',
        ];
    }

    /**
     * Get custom validation messages for request errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cart_item_ids.required' => 'Please select at least one item to purchase.',
            'cart_item_ids.array' => 'The selected items must be provided as an array.',
            'cart_item_ids.min' => 'You must select at least one item.',
            'cart_item_ids.*.required' => 'Each selected item must have a valid ID.',
            'cart_item_ids.*.integer' => 'Each selected item ID must be a valid integer.',
            'cart_item_ids.*.exists' => 'One or more selected items are invalid or do not exist.',
        ];
    }
}
