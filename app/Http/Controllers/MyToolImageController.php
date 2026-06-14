<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreMyToolImagesRequest;
use App\Models\Tool;
use App\Models\ToolImage;
use App\Services\ToolImageUploader;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;

class MyToolImageController extends Controller
{
    public function store(StoreMyToolImagesRequest $request, Tool $tool): RedirectResponse
    {
        try {
            app(ToolImageUploader::class)->attach($tool, $request->file('images'));
        } catch (Throwable) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Não foi possível salvar as imagens. Verifique o formato (JPEG, PNG ou WebP), o tamanho (até 5 MB cada) e tente novamente.',
            ]);

            return back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Imagens adicionadas.',
        ]);

        return back();
    }

    public function destroy(Tool $tool, ToolImage $toolImage): RedirectResponse
    {
        $this->authorize('update', $tool);

        abort_unless((int) $toolImage->tool_id === (int) $tool->id, 404);

        $path = $toolImage->path;
        $toolImage->delete();

        if ($path !== '') {
            Storage::disk('public')->delete($path);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Imagem removida.',
        ]);

        return back();
    }
}
