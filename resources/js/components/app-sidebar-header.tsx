import { usePage, Link } from '@inertiajs/react';
import { Bell, LogOut } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
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
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 bg-background/80 px-6 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <div className="hidden md:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2">
                <button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full border-2 border-background bg-red-500"></span>
                </button>

                <div className="mx-2 hidden h-8 w-[1px] bg-border sm:block"></div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-xl p-1 pr-3 transition-colors outline-none hover:bg-muted">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                />
                                <AvatarFallback className="rounded-lg bg-primary/10 font-bold text-primary">
                                    {auth.user.name
                                        .substring(0, 1)
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start leading-none sm:flex">
                                <span className="text-sm font-semibold">
                                    {auth.user.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                    Administrator
                                </span>
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
                    className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500"
                >
                    <LogOut className="h-5 w-5" />
                </Link>
            </div>
        </header>
    );
}
