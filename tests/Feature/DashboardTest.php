<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->cliente()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertRedirect(route('cliente.dashboard'));

    $this->get(route('cliente.dashboard'))
        ->assertOk();
});

test('admin users are redirected to admin dashboard', function () {
    $user = User::factory()->admin()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertRedirect(route('admin.dashboard'));

    $this->get(route('admin.dashboard'))
        ->assertOk();
});