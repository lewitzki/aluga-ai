<?php

namespace App\Policies;

use App\Models\Tool;
use App\Models\User;

class ToolPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Tool $tool): bool
    {
        return (int) $tool->owner_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Tool $tool): bool
    {
        return (int) $tool->owner_id === (int) $user->id;
    }

    public function delete(User $user, Tool $tool): bool
    {
        return (int) $tool->owner_id === (int) $user->id;
    }
}
