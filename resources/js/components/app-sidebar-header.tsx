import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, Bell, LogOut } from 'lucide-react';
import { UserMenuContent } from '@/components/user-menu-content';
import { usePage, Link } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as any;

    if (!auth?.user) {
        return null;
    }

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <div className="hidden md:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                </button>

                <div className="h-8 w-[1px] bg-border mx-2 hidden sm:block"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 p-1 pr-3 hover:bg-muted rounded-xl transition-colors outline-none">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                                    {auth.user.name.substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:flex flex-col items-start leading-none">
                                <span className="text-sm font-semibold">{auth.user.name}</span>
                                <span className="text-[10px] text-muted-foreground">Administrator</span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        sideOffset={4}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link 
                    href="/logout" 
                    method="post" 
                    as="button"
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut className="w-5 h-5" />
                </Link>
            </div>
        </header>
    );
}

