import { Head, Link, setLayoutProps, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, GraduationCap, Mail, UserCheck, UserX, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, UserPlus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import admin from '@/routes/admin';

interface Teacher {
    id: string;
    nip: string;
    specialization: string;
    photo_url?: string;
    user_name: string;
    user_email: string;
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
}

interface Props {
    teachers: PaginatedData<Teacher>;
    filters: Filters;
}

const SortIcon = ({ field, currentSort, direction }: { field: string; currentSort?: string; direction?: 'asc' | 'desc' }) => {
    if (currentSort !== field) {
return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
}

    return direction === 'asc' 
        ? <ArrowUp className="w-3 h-3 ml-1 text-primary" /> 
        : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
};

export default function TeacherList({ teachers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Daftar Guru',
                href: admin.teachers.index.url(),
            },
        ],
    });

    const handleSearch = useCallback((value: string) => {
        router.get(
            admin.teachers.index.url(),
            { ...filters, search: value, page: 1 },
            { preserveState: true, replace: true }
        );
    }, [filters]);

    // Simple debounce effect
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
        router.get(
            admin.teachers.index.url(),
            { ...filters, sort: field, direction },
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title="Daftar Guru" />
            
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Daftar Guru</h1>
                        <p className="text-muted-foreground">Kelola semua data profil guru dalam satu tempat.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari nama atau NIP..." 
                                    className="pl-9 h-10 bg-background/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 shrink-0"
                                onClick={() => {
                                    setSearch('');
                                    router.get(admin.teachers.index.url(), {}, { replace: true });
                                }}
                            >
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <Button className="w-full sm:w-auto h-10 gap-2 shadow-lg shadow-primary/20" asChild>
                            <Link href={admin.teachers.create.url()}>
                                <UserPlus className="w-4 h-4" />
                                <span>Tambah Guru Baru</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-zinc-200 dark:border-zinc-800">
                                    <th 
                                        className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleSort('users.name')}
                                    >
                                        <div className="flex items-center">
                                            Guru <SortIcon field="users.name" currentSort={filters.sort} direction={filters.direction} />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleSort('teachers.nip')}
                                    >
                                        <div className="flex items-center">
                                            Detail Profil <SortIcon field="teachers.nip" currentSort={filters.sort} direction={filters.direction} />
                                        </div>
                                    </th>
                                    <th 
                                        className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => handleSort('teachers.created_at')}
                                    >
                                        <div className="flex items-center">
                                            Terdaftar <SortIcon field="teachers.created_at" currentSort={filters.sort} direction={filters.direction} />
                                        </div>
                                    </th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {teachers.data.length > 0 ? (
                                    teachers.data.map((teacher, index) => (
                                        <motion.tr 
                                            key={teacher.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-muted/30 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                                        <AvatarImage src={teacher.photo_url} alt={teacher.user_name} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                            {teacher.user_name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm group-hover:text-primary transition-colors">{teacher.user_name}</span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {teacher.user_email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="w-fit text-[10px] font-bold py-0 h-5 bg-muted/50 border-zinc-200 dark:border-zinc-800">
                                                        {teacher.nip}
                                                    </Badge>
                                                    <span className="text-xs font-medium text-foreground flex items-center gap-1">
                                                        <GraduationCap className="w-3 h-3 text-muted-foreground" />
                                                        {teacher.specialization}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {new Date(teacher.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                                        {new Date(teacher.created_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })} WIB
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                            <UserCheck className="w-4 h-4 text-emerald-500" />
                                                            <span>Lihat Detail</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                                                            <UserX className="w-4 h-4" />
                                                            <span>Nonaktifkan Guru</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                            Belum ada data guru yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan <span className="font-bold text-foreground">{teachers.from || 0}</span> sampai <span className="font-bold text-foreground">{teachers.to || 0}</span> dari <span className="font-bold text-foreground">{teachers.total}</span> guru
                        </p>
                        <div className="flex items-center gap-1">
                            {teachers.links.map((link, i) => {
                                const label = link.label.toLowerCase();
                                const isPrev = label.includes('previous') || label.includes('prev') || label.includes('&laquo;') || label.includes('pagination.previous');
                                const isNext = label.includes('next') || label.includes('&raquo;') || label.includes('pagination.next');
                                const isEllipsis = link.label === '...';
                                
                                if (isEllipsis) {
                                    return (
                                        <div key={i} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">
                                            ...
                                        </div>
                                    );
                                }

                                return (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size={isPrev || isNext ? 'default' : 'icon'}
                                        className={`h-8 ${isPrev || isNext ? 'px-3' : 'w-8'} text-xs transition-all`}
                                        asChild={!!link.url}
                                        disabled={!link.url || link.active}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} preserveScroll>
                                                {isPrev && <ChevronLeft className="mr-1 h-4 w-4" />}
                                                {isPrev ? 'Sebelumnya' : isNext ? 'Selanjutnya' : link.label}
                                                {isNext && <ChevronRight className="ml-1 h-4 w-4" />}
                                            </Link>
                                        ) : (
                                            <span className="flex items-center opacity-50 px-2">
                                                {isPrev && <ChevronLeft className="mr-1 h-4 w-4" />}
                                                {isPrev ? 'Sebelumnya' : isNext ? 'Selanjutnya' : link.label}
                                                {isNext && <ChevronRight className="ml-1 h-4 w-4" />}
                                            </span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}
