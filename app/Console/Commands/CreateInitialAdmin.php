<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateInitialAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:create-initial-admin
                            {name : Nome do admin inicial}
                            {email : Email do admin inicial}
                            {password : Senha em texto plano}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria o admin inicial de forma controlada';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $existingAdmin = User::query()
            ->where('profile', User::PROFILE_ADMIN)
            ->exists();

        if ($existingAdmin) {
            $this->components->error('Ja existe um usuario admin cadastrado.');

            return self::FAILURE;
        }

        $admin = User::query()->create([
            'name' => (string) $this->argument('name'),
            'email' => (string) $this->argument('email'),
            'password' => (string) $this->argument('password'),
            'profile' => User::PROFILE_ADMIN,
            'is_active' => true,
        ]);

        $admin->forceFill([
            'email_verified_at' => now(),
        ])->save();

        $this->components->info('Admin inicial criado com sucesso.');

        return self::SUCCESS;
    }
}
