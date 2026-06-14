<?php

namespace App\Http\Controllers;

use App\Enums\RentalStatus;
use App\Http\Requests\Client\StoreMyToolRequest;
use App\Http\Requests\Client\UpdateMyToolRequest;
use App\Models\Rental;
use App\Models\Tool;
use App\Models\ToolImage;
use App\Services\ToolImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MyToolsController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Tool::class);

        $rentedToolIds = Rental::query()
            ->where('status', '!=', RentalStatus::Finished)
            ->distinct()
            ->pluck('tool_id');

        $tools = Tool::query()
            ->where('owner_id', Auth::id())
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->orderBy('name')
            ->paginate(15)
            ->through(fn (Tool $t) => self::serializeRow($t, $rentedToolIds));

        return Inertia::render('MyTools/Index', [
            'tools' => $tools,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Tool::class);

        return Inertia::render('MyTools/Create', [
            'tool' => [
                'name' => '',
                'description' => '',
                'hourly_rate' => '',
                'is_available' => true,
            ],
        ]);
    }

    public function store(StoreMyToolRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $tool = Tool::query()->create([
            'owner_id' => Auth::id(),
            'name' => $data['name'],
            'description' => $data['description'],
            'hourly_rate' => $data['hourly_rate'],
            'is_available' => $data['is_available'],
        ]);

        $uploadFailed = false;

        if ($request->hasFile('images')) {
            try {
                app(ToolImageUploader::class)->attach($tool, $request->file('images'));
            } catch (Throwable) {
                $uploadFailed = true;
            }
        }

        if ($uploadFailed) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Ferramenta cadastrada, mas não foi possível salvar uma ou mais imagens. Você pode enviá-las ao editar o cadastro.',
            ]);

            return to_route('my-tools.edit', ['tool' => $tool]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ferramenta cadastrada.',
        ]);

        return to_route('my-tools.index');
    }

    public function edit(Tool $tool): Response
    {
        $this->authorize('view', $tool);

        $tool->load(['images' => fn ($q) => $q->orderBy('sort_order')]);

        $hasActiveRental = $tool->hasNonFinishedRentals();

        return Inertia::render('MyTools/Edit', [
            'tool' => self::serializeForm($tool, $hasActiveRental),
        ]);
    }

    public function update(UpdateMyToolRequest $request, Tool $tool): RedirectResponse
    {
        $tool->fill($request->validated());
        $tool->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ferramenta atualizada.',
        ]);

        return to_route('my-tools.edit', ['tool' => $tool]);
    }

    public function destroy(Tool $tool): RedirectResponse
    {
        $this->authorize('delete', $tool);

        if ($tool->hasNonFinishedRentals()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Não é possível excluir: existe empréstimo ativo ou pendente.',
            ]);

            return to_route('my-tools.index');
        }

        $tool->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ferramenta removida.',
        ]);

        return to_route('my-tools.index');
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int|string>  $rentedToolIds
     * @return array<string, mixed>
     */
    private static function serializeRow(Tool $tool, $rentedToolIds): array
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
            'operational_status' => self::resolveOperationalStatus($tool, $rentedToolIds),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeForm(Tool $tool, bool $hasActiveRental): array
    {
        $images = [];
        foreach ($tool->images as $image) {
            if (! $image->path) {
                continue;
            }
            $images[] = [
                'id' => $image->id,
                'url' => Storage::disk('public')->url($image->path),
                'alt' => $tool->name,
            ];
        }

        $rentedToolIds = $hasActiveRental
            ? collect([$tool->id])
            : collect();

        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'description' => $tool->description ?? '',
            'hourly_rate' => (string) $tool->hourly_rate,
            'is_available' => $tool->is_available,
            'images' => $images,
            'max_images' => ToolImage::MAX_PER_TOOL,
            'operational_status' => self::resolveOperationalStatus($tool, $rentedToolIds),
            'has_active_rental' => $hasActiveRental,
            'catalog_url' => route('catalog.show', ['tool' => $tool]),
        ];
    }

    /**
     * @param  \Illuminate\Support\Collection<int, int|string>  $rentedToolIds
     */
    private static function resolveOperationalStatus(Tool $tool, $rentedToolIds): string
    {
        if ($rentedToolIds->contains($tool->id)) {
            return 'emprestada';
        }

        if (! $tool->is_available) {
            return 'indisponivel';
        }

        return 'disponivel';
    }
}
