import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Check,
    X,
    AlertTriangle,
    Shield,
    User as UserIcon,
    Mail,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import admin from '@/routes/admin';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'guru' | 'siswa';
    is_approved: boolean;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Filters {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    status?: string;
}

interface Props {
    users: PaginatedData<User>;
    filters: Filters;
}

const SortIcon = ({
    field,
    currentSort,
    direction,
}: {
    field: string;
    currentSort?: string;
    direction?: 'asc' | 'desc';
}) => {
    if (currentSort !== field) {
        return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    }

    return direction === 'asc' ? (
        <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
        <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    );
};

export default function UserApprovalList({ users, filters }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [showSuccess, setShowSuccess] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const handleApprove = (id: number) => {
        setProcessingId(id);
        const url = admin.users?.approve?.url 
            ? admin.users.approve.url(id.toString()) 
            : `/admin/users/${id}/approve`;

        router.put(url, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessingId(null);
            },
            onFinish: () => setProcessingId(null),
        });
    };

    useEffect(() => {
        if (flash?.success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Manajemen User',
                href: admin.users?.index?.url ? admin.users.index.url() : '/admin/users',
            },
            {
                title: 'Persetujuan User',
                href: admin.users?.approval?.url ? admin.users.approval.url() : '/admin/approval',
            },
        ],
    });

    const handleSearch = useCallback(
        (value: string) => {
            const url = admin.users?.approval?.url ? admin.users.approval.url() : '/admin/approval';
            router.get(
                url,
                { ...filters, search: value, page: 1 },
                { preserveState: true, replace: true },
            );
        },
        [filters],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleSearch(search);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, handleSearch, filters.search]);

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        const url = admin.users?.approval?.url ? admin.users.approval.url() : '/admin/approval';
        router.get(
            url,
            { ...filters, sort: field, direction },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Persetujuan User" />

            <div className="flex flex-col gap-6 p-6">
                <AnimatePresence>
                    {showSuccess && flash?.success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="mb-2 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="flex-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                    {flash.success}
                                </div>
                                <button onClick={() => setShowSuccess(false)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-70">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0 h-10 w-10">
                            <Link href={admin.users?.index?.url ? admin.users.index.url() : '/admin/users'}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Persetujuan User</h1>
                            <p className="text-muted-foreground">
                                Daftar akun baru yang memerlukan verifikasi untuk mengakses sistem.
                            </p>
                        </div>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari nama atau email..."
                            className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                    <th className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary" onClick={() => handleSort('name')}>
                                        <div className="flex items-center">
                                            User <SortIcon field="name" currentSort={filters.sort} direction={filters.direction} />
                                        </div>
                                    </th>
                                    <th className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary" onClick={() => handleSort('role')}>
                                        <div className="flex items-center">
                                            Peran <SortIcon field="role" currentSort={filters.sort} direction={filters.direction} />
                                        </div>
                                    </th>
                                    <th className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center">
                                            Tgl Registrasi <SortIcon field="created_at" currentSort={filters.sort} direction={filters.direction} />
                                        </div>
                                    </th>
                                    <th className="p-4 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {users.data.length > 0 ? (
                                    users.data.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                            {user.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">{user.name}</span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="capitalize">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                        {new Date(user.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="h-8 gap-1.5 shadow-sm"
                                                    onClick={() => handleApprove(user.id)}
                                                    disabled={processingId === user.id}
                                                >
                                                    {processingId === user.id ? (
                                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                    ) : (
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                    )}
                                                    <span>Setujui</span>
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="rounded-full bg-muted p-4">
                                                    <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">
                                                    Tidak ada user yang menunggu persetujuan.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.total > 0 && (
                        <div className="flex items-center justify-between border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800">
                            <p className="text-xs text-muted-foreground">
                                Menampilkan <span className="font-bold text-foreground">{users.from}</span> sampai <span className="font-bold text-foreground">{users.to}</span> dari <span className="font-bold text-foreground">{users.total}</span> pendaftar
                            </p>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, i) => {
                                    const label = link.label.toLowerCase();
                                    const isPrev =
                                        label.includes('previous') ||
                                        label.includes('prev') ||
                                        label.includes('&laquo;') ||
                                        label.includes('pagination.previous');
                                    const isNext =
                                        label.includes('next') ||
                                        label.includes('&raquo;') ||
                                        label.includes('pagination.next');
                                    const isEllipsis = link.label === '...';

                                    if (isEllipsis) {
                                        return (
                                            <div
                                                key={i}
                                                className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                                            >
                                                ...
                                            </div>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size={isPrev || isNext ? 'default' : 'icon'}
                                            className={`h-8 ${isPrev || isNext ? 'px-3' : 'w-8'} text-xs`}
                                            asChild={!!link.url}
                                            disabled={!link.url || link.active}
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveScroll>
                                                    {isPrev && (
                                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                                    )}
                                                    {isPrev
                                                        ? 'Sebelumnya'
                                                        : isNext
                                                          ? 'Selanjutnya'
                                                          : link.label}
                                                    {isNext && (
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    )}
                                                </Link>
                                            ) : (
                                                <span className="flex items-center px-2 opacity-50">
                                                    {isPrev && (
                                                        <ChevronLeft className="mr-1 h-4 w-4" />
                                                    )}
                                                    {isPrev
                                                        ? 'Sebelumnya'
                                                        : isNext
                                                          ? 'Selanjutnya'
                                                          : link.label}
                                                    {isNext && (
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    )}
                                                </span>
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );
}
