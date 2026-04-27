<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class TestUsersSeeder extends Seeder
{
    /**
     * Seed users for auth and profile tests.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin Teste',
                'email' => 'admin@teste.local',
                'profile' => User::PROFILE_ADMIN,
                'is_active' => true,
            ],
            [
                'name' => 'Cliente Teste',
                'email' => 'cliente@teste.local',
                'profile' => User::PROFILE_CLIENTE,
                'is_active' => true,
            ],
            [
                'name' => 'Inativo Teste',
                'email' => 'inativo@teste.local',
                'profile' => User::PROFILE_CLIENTE,
                'is_active' => false,
            ],
            [
                'name' => 'Sem Perfil Teste',
                'email' => 'sem-perfil@teste.local',
                'profile' => null,
                'is_active' => true,
            ],
        ];

        foreach ($users as $data) {
            User::query()->updateOrCreate(
                ['email' => $data['email']],
                [
                    ...$data,
                    'email_verified_at' => now(),
                    'password' => 'password',
                ],
            );
        }
    }
}
