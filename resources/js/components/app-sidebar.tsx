import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    DollarSign,
    FolderGit2,
    LayoutGrid,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
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
import type { NavItem, User } from '@/types';

function dashboardNavItem(user: User | null | undefined): NavItem {
    const href = user != null ? homeDashboard(user) : dashboard();

    return {
        title: 'Dashboard',
        href,
        icon: LayoutGrid,
    };
}

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

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
            : []),
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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
