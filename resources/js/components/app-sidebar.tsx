import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Library,
    Users,
    GraduationCap,
    Shield,
    UserCheck,
    School,
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
import adminRoutes from '@/routes/admin/index';
import { dashboard } from '@/routes/index';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props as { auth: Auth };

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Tambahkan menu Admin/Guru jika role sesuai
    if (auth?.user?.role === 'admin' || auth?.user?.role === 'guru') {
        mainNavItems.push({
            title: 'Mata Pelajaran',
            href: '/teacher/subjects',
            icon: Library,
        });
    }

    if (auth?.user?.role === 'admin') {
        mainNavItems.push({
            title: 'Manajemen Jurusan & Kelas',
            href: adminRoutes.majors.index.url(),
            icon: School,
        });

        mainNavItems.push({
            title: 'Daftar Guru',
            href: adminRoutes.teachers.index.url(),
            icon: Users,
        });

        mainNavItems.push({
            title: 'Daftar Siswa',
            href: adminRoutes.students.index.url(),
            icon: GraduationCap,
        });

        mainNavItems.push({
            title: 'Manajemen User',
            href: adminRoutes.users.index.url(),
            icon: Shield,
        });

        mainNavItems.push({
            title: 'Persetujuan User',
            href: adminRoutes.users.approval.url(),
            icon: UserCheck,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
