<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\StoreToolRequest;
use App\Http\Requests\Admin\UpdateToolRequest;
use App\Models\Tool;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminToolController extends Controller
{
    public function index(): Response
    {
        $tools = Tool::query()
            ->where('user_id', Auth::id())
            ->orderBy('name')
            ->paginate(15)
            ->through(fn (Tool $t) => self::serializeRow($t));

        return Inertia::render('admin/tools/index', [
            'tools' => $tools,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/tools/create', [
            'tool' => [
                'name' => '',
                'description' => '',
                'hourly_rate' => '',
                'is_available' => true,
            ],
        ]);
    }

    public function store(StoreToolRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Tool::query()->create([
            'user_id' => Auth::id(),
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'hourly_rate' => $data['hourly_rate'],
            'is_available' => $data['is_available'],
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ferramenta cadastrada.',
        ]);

        return to_route('admin.tools.index');
    }

    public function edit(Tool $tool): Response
    {
        $this->authorizeOwned($tool);

        return Inertia::render('admin/tools/edit', [
            'tool' => self::serializeForm($tool),
        ]);
    }

    public function update(UpdateToolRequest $request, Tool $tool): RedirectResponse
    {
        $this->authorizeOwned($tool);

        $tool->fill($request->validated());
        $tool->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ferramenta atualizada.',
        ]);

        return to_route('admin.tools.edit', ['tool' => $tool]);
    }

    public function destroy(Tool $tool): RedirectResponse
    {
        $this->authorizeOwned($tool);

        if ($tool->hasNonFinishedRentals()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Não é possível excluir: existe empréstimo ativo ou pendente.',
            ]);

            return to_route('admin.tools.index');
        }

        $tool->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Ferramenta removida.',
        ]);

        return to_route('admin.tools.index');
    }

    private function authorizeOwned(Tool $tool): void
    {
        abort_unless((int) $tool->user_id === (int) Auth::id(), 403);
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeRow(Tool $tool): array
    {
        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'description' => $tool->description,
            'hourly_rate' => (string) $tool->hourly_rate,
            'is_available' => $tool->is_available,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function serializeForm(Tool $tool): array
    {
        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'description' => $tool->description ?? '',
            'hourly_rate' => (string) $tool->hourly_rate,
            'is_available' => $tool->is_available,
        ];
    }
}
