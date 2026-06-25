import { Link, usePage } from '@inertiajs/react';
import { DollarSign, LayoutGrid, Wrench } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { homeDashboard, logoHome } from '@/lib/home-dashboard';
import { dashboard } from '@/routes';
import admin from '@/routes/admin';
import adminTools from '@/routes/admin/tools';
import myTools from '@/routes/my-tools';
import type { NavItem, User } from '@/types';

function dashboardNavItem(user: User | null | undefined): NavItem {
    const href = user != null ? homeDashboard(user) : dashboard();

    return {
        title: 'Dashboard',
        href,
        icon: LayoutGrid,
    };
}

export function AppSidebar() {
    const { auth } = usePage().props;
    const mainNavItems: NavItem[] = [
        dashboardNavItem(auth.user),
        ...(auth.user?.profile === 'admin'
            ? [
                  {
                      title: 'Financeiro',
                      href: admin.finance.url(),
                      icon: DollarSign,
                  },
                  {
                      title: 'Ferramentas',
                      href: adminTools.index.url(),
                      icon: Wrench,
                  },
              ]
            : [
                  {
                      title: 'Minhas Ferramentas',
                      href: myTools.index.url(),
                      icon: Wrench,
                  },
              ]),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={logoHome(auth.user)} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
