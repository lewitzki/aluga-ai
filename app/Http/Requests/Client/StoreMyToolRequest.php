<?php

namespace App\Http\Requests\Client;

use App\Models\ToolImage;
use Illuminate\Foundation\Http\FormRequest;

class StoreMyToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Models\Tool::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_available' => $this->boolean('is_available'),
        ]);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:65535'],
            'hourly_rate' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_available' => ['required', 'boolean'],
            'images' => ['sometimes', 'nullable', 'array', 'max:'.ToolImage::MAX_PER_TOOL],
            'images.*' => [
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:'.ToolImage::MAX_UPLOAD_KILOBYTES,
            ],
        ];
    }
}
