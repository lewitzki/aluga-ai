<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Carbon\Carbon;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class ToolCatalogController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'descricao' => ['sometimes', 'nullable', 'string', 'max:255'],
            'preco_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'preco_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'disponivel' => ['sometimes', 'nullable', 'in:todos,sim,nao'],
            'periodo_inicio' => ['sometimes', 'nullable', 'required_with:periodo_fim', 'date'],
            'periodo_fim' => ['sometimes', 'nullable', 'required_with:periodo_inicio', 'date', 'after:periodo_inicio'],
            'page' => ['sometimes', 'nullable', 'integer', 'min:1'],
        ]);

        $filters = [
            'descricao' => isset($validated['descricao']) ? trim((string) $validated['descricao']) : '',
            'preco_min' => $validated['preco_min'] ?? null,
            'preco_max' => $validated['preco_max'] ?? null,
            'disponivel' => $validated['disponivel'] ?? 'todos',
            'periodo_inicio' => $validated['periodo_inicio'] ?? null,
            'periodo_fim' => $validated['periodo_fim'] ?? null,
        ];

        $query = Tool::query()
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->orderBy('name');

        $descricao = $filters['descricao'];
        if ($descricao !== '') {
            $query->where(function (Builder $q) use ($descricao) {
                $like = '%'.$descricao.'%';
                $q->where('name', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        if ($filters['preco_min'] !== null) {
            $query->where('hourly_rate', '>=', $filters['preco_min']);
        }

        if ($filters['preco_max'] !== null) {
            $query->where('hourly_rate', '<=', $filters['preco_max']);
        }

        match ($filters['disponivel']) {
            'sim' => $query->where('is_available', true),
            'nao' => $query->where('is_available', false),
            default => null,
        };

        $periodStart = $filters['periodo_inicio']
            ? Carbon::parse($filters['periodo_inicio'])
            : null;
        $periodEnd = $filters['periodo_fim']
            ? Carbon::parse($filters['periodo_fim'])
            : null;

        if ($periodStart && $periodEnd && $periodStart->lt($periodEnd)) {
            $query->whereDoesntHave('rentals', function (Builder $rentals) use ($periodStart, $periodEnd) {
                $rentals->whereRaw(
                    'rentals.starts_at < ? AND COALESCE(rentals.ended_at, rentals.expected_ends_at) > ?',
                    [$periodEnd, $periodStart]
                );
            });
        }

        $tools = $query
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Tool $tool) => self::serializeTool($tool));

        return Inertia::render('catalog', [
            'filters' => $filters,
            'tools' => $tools,
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeTool(Tool $tool): array
    {
        $first = $tool->images->first();
        $thumbnailUrl = null;
        if ($first && $first->path) {
            $thumbnailUrl = Storage::disk('public')->url($first->path);
        }

        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'description' => $tool->description,
            'hourly_rate' => (string) $tool->hourly_rate,
            'is_available' => $tool->is_available,
            'thumbnail_url' => $thumbnailUrl,
        ];
    }
}
