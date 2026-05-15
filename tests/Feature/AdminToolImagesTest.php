<?php

use App\Models\Tool;
use App\Models\ToolImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('admin anexa imagens ao criar ferramenta', function () {
    $admin = User::factory()->admin()->create();

    $file = UploadedFile::fake()->image('tool.jpg', 400, 300);

    $this->actingAs($admin)
        ->post(route('admin.tools.store'), [
            'name' => 'Com foto',
            'description' => null,
            'hourly_rate' => '10',
            'is_available' => '1',
            'images' => [$file],
        ])
        ->assertRedirect(route('admin.tools.index'));

    $tool = Tool::query()->where('name', 'Com foto')->first();

    expect($tool)->not->toBeNull()
        ->and($tool->images)->toHaveCount(1);

    Storage::disk('public')->assertExists($tool->images->first()->path);
});

test('admin recebe erro de validação ao exceder máximo de imagens na criação', function () {
    $admin = User::factory()->admin()->create();

    $files = [];
    for ($i = 0; $i < ToolImage::MAX_PER_TOOL + 1; $i++) {
        $files[] = UploadedFile::fake()->image("x{$i}.jpg", 100, 100);
    }

    $this->actingAs($admin)
        ->post(route('admin.tools.store'), [
            'name' => 'Estoura fotos',
            'hourly_rate' => '5',
            'is_available' => '1',
            'images' => $files,
        ])
        ->assertSessionHasErrors('images');

    expect(Tool::query()->where('name', 'Estoura fotos')->exists())->toBeFalse();
});

test('admin adiciona imagens pela rota de edição', function () {
    $admin = User::factory()->admin()->create();
    $tool = Tool::factory()->create(['user_id' => $admin->id]);

    $one = UploadedFile::fake()->image('a.jpg');
    $two = UploadedFile::fake()->image('b.jpg');

    $this->actingAs($admin)
        ->post(route('admin.tools.images.store', $tool), [
            'images' => [$one, $two],
        ])
        ->assertRedirect();

    expect($tool->fresh()->images)->toHaveCount(2);
    foreach ($tool->fresh()->images as $img) {
        Storage::disk('public')->assertExists($img->path);
    }
});

test('admin remove imagem e arquivo no disco', function () {
    $admin = User::factory()->admin()->create();
    $tool = Tool::factory()->create(['user_id' => $admin->id]);

    $path = 'tools/'.$tool->id.'/fake.jpg';
    Storage::disk('public')->put($path, 'x');

    $image = ToolImage::query()->create([
        'tool_id' => $tool->id,
        'path' => $path,
        'sort_order' => 10,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.tools.images.destroy', [$tool, $image]))
        ->assertRedirect();

    expect(ToolImage::query()->find($image->id))->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('admin não gerencia imagens de ferramenta de outro usuário', function () {
    $admin = User::factory()->admin()->create();
    $other = User::factory()->admin()->create();
    $tool = Tool::factory()->create(['user_id' => $other->id]);

    $file = UploadedFile::fake()->image('nope.jpg');

    $this->actingAs($admin)
        ->post(route('admin.tools.images.store', $tool), [
            'images' => [$file],
        ])
        ->assertForbidden();
});
