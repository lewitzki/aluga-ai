import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import catalog from '@/routes/catalog';
import { dashboard as clienteDashboard } from '@/routes/cliente';
import type { User } from '@/types';

/** Matches Laravel `App\Models\User` profile constants. */
export function homeDashboard(user: Pick<User, 'profile'>) {
    if (user.profile === 'admin') {
        return adminDashboard();
    }

    return user.profile === 'cliente' ? clienteDashboard() : dashboard();
}

/** Sidebar/header logo link — admins return to the public catalog. */
export function logoHome(user: User | null | undefined) {
    if (user == null) {
        return dashboard();
    }

    if (user.profile === 'admin') {
        return catalog.index();
    }

    return homeDashboard(user);
}
