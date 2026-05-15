import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { dashboard as clienteDashboard } from '@/routes/cliente';
import type { User } from '@/types';

/** Matches Laravel `App\Models\User` profile constants. */
export function homeDashboard(user: Pick<User, 'profile'>) {
    if (user.profile === 'admin') {
        return adminDashboard();
    }

    return user.profile === 'cliente' ? clienteDashboard() : dashboard();
}
