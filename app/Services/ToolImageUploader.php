<?php

namespace App\Services;

use App\Models\Tool;
use App\Models\ToolImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ToolImageUploader
{
    /**
     * @param  list<UploadedFile>  $files
     *
     * @throws Throwable
     */
    public function attach(Tool $tool, array $files): void
    {
        $disk = Storage::disk('public');
        $storedPaths = [];

        try {
            foreach (array_values($files) as $file) {
                $path = $file->store('tools/'.$tool->id, 'public');
                if ($path === false || $path === '') {
                    throw new \RuntimeException('Armazenamento retornou caminho vazio para o upload.');
                }
                $storedPaths[] = $path;
            }

            $baseOrder = (int) ($tool->images()->max('sort_order') ?? 0);

            DB::transaction(function () use ($tool, $storedPaths, $baseOrder): void {
                foreach ($storedPaths as $index => $path) {
                    ToolImage::query()->create([
                        'tool_id' => $tool->id,
                        'path' => $path,
                        'sort_order' => $baseOrder + ($index + 1) * 10,
                    ]);
                }
            });
        } catch (Throwable $e) {
            foreach ($storedPaths as $path) {
                $disk->delete($path);
            }

            Log::error('Falha no upload de imagem da ferramenta.', [
                'tool_id' => $tool->id,
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
