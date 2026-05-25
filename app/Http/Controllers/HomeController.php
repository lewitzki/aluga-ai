<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featured = Tool::query()
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->where('is_available', true)
            ->whereHas('images')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Tool $tool) => $this->serialize($tool))
            ->values();

        $latest = Tool::query()
            ->with(['images' => fn ($q) => $q->orderBy('sort_order')->limit(1)])
            ->where('is_available', true)
            ->whereHas('images')
            ->orderByDesc('id')
            ->skip(10)
            ->take(8)
            ->get()
            ->map(fn (Tool $tool) => $this->serialize($tool))
            ->values();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'featuredTools' => $featured,
            'latestTools' => $latest,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Tool $tool): array
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
