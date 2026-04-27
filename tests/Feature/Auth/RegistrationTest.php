<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'test@example.com')->firstOrFail();

    expect($user->profile)->toBe(User::PROFILE_CLIENTE)
        ->and($user->is_active)->toBeTrue();
});

test('new users can not escalate profile during register', function () {
    $this->post(route('register.store'), [
        'name' => 'Escalation Test',
        'email' => 'escalation@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'profile' => User::PROFILE_ADMIN,
    ]);

    $user = User::query()->where('email', 'escalation@example.com')->firstOrFail();

    expect($user->profile)->toBe(User::PROFILE_CLIENTE);
});

test('newly registered users can access dashboard without email verification', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Unverified User',
        'email' => 'unverified@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->get(route('dashboard'))
        ->assertRedirect(route('cliente.dashboard'));
});