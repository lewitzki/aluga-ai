<?php

namespace App\Http\Requests\Client;

use App\Models\Tool;
use App\Models\ToolImage;
use Illuminate\Foundation\Http\FormRequest;

class StoreMyToolImagesRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool instanceof Tool
            && ($this->user()?->can('update', $tool) ?? false);
    }

    /**
     * @return array<string, array<int, mixed|string>>
     */
    public function rules(): array
    {
        /** @var Tool $tool */
        $tool = $this->route('tool');
        $remaining = max(0, ToolImage::MAX_PER_TOOL - $tool->images()->count());

        return [
            'images' => [
                'required',
                'array',
                'min:1',
                'max:'.$remaining,
            ],
            'images.*' => [
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:'.ToolImage::MAX_UPLOAD_KILOBYTES,
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.max' => 'Cada ferramenta pode ter no máximo '.ToolImage::MAX_PER_TOOL.' imagens.',
        ];
    }
}
