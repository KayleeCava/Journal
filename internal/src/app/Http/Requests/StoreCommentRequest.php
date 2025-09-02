<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Route đã được bảo vệ bởi middleware auth:sanctum,
        // nên ở đây chỉ cần đảm bảo người dùng đã đăng nhập.
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ];
    }
}
