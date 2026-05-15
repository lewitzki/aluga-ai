<?php

namespace App\Models;

use Database\Factories\ToolImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['tool_id', 'path', 'sort_order'])]
class ToolImage extends Model
{
    public const MAX_PER_TOOL = 10;

    /** Tamanho máximo por arquivo em kilobytes (regra Laravel `max:` em uploads). */
    public const MAX_UPLOAD_KILOBYTES = 5120;

    /** @use HasFactory<ToolImageFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }
}
