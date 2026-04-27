<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('initial admin can be created through controlled command', function () {
    $this->artisan('users:create-initial-admin', [
        'name' => 'Admin Inicial',
        'email' => 'admin.inicial@example.com',
        'password' => 'password',
    ])->assertSuccessful();

    $admin = User::query()->where('email', 'admin.inicial@example.com')->first();

    expect($admin)->not()->toBeNull()
        ->and($admin->profile)->toBe(User::PROFILE_ADMIN)
        ->and($admin->is_active)->toBeTrue()
        ->and($admin->hasVerifiedEmail())->toBeTrue();
});

test('initial admin command fails when admin already exists', function () {
    User::factory()->admin()->create();

    $this->artisan('users:create-initial-admin', [
        'name' => 'Outro Admin',
        'email' => 'outro.admin@example.com',
        'password' => 'password',
    ])->assertFailed();

    $admins = User::query()->where('profile', User::PROFILE_ADMIN)->count();

    expect($admins)->toBe(1);
});
