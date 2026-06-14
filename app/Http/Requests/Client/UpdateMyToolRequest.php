<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMyToolRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tool = $this->route('tool');

        return $tool instanceof \App\Models\Tool
            && ($this->user()?->can('update', $tool) ?? false);
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
        ];
    }
}
