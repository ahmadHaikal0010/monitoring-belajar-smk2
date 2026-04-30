import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    BookOpen,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Plus,
    X,
    MoreVertical,
    Pencil,
    Trash2,
    BookCheck,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Subject {
    id: string;
    teacher_id: string;
    title: string;
    description: string;
    teacher_name: string;
    teacher_email: string;
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
    subjects: PaginatedData<Subject>;
    filters: Filters;
}

export default function SubjectList({ subjects, filters }: Props) {
    const { auth, flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.success, flash?.error]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Mata Pelajaran',
                href: '/teacher/subjects',
            },
        ],
    });

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/teacher/subjects',
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
        const direction =
            filters.sort === field && filters.direction === 'asc'
                ? 'desc'
                : 'asc';
        router.get(
            '/teacher/subjects',
            { ...filters, sort: field, direction },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Daftar Mata Pelajaran" />

            <div className="flex flex-col gap-6 p-6">
                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div
                                className={cn(
                                    'mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm',
                                    flash.success
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                                        : 'border-destructive/20 bg-destructive/10 text-destructive',
                                )}
                            >
                                {flash.success ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowFlash(false)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Mata Pelajaran
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola materi dan mata pelajaran yang tersedia dalam
                            sistem.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <div className="flex w-full items-center gap-3 sm:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari mata pelajaran..."
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-10 w-10 shrink-0"
                                    >
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <div className="p-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Urutkan Berdasarkan
                                    </div>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSort('subjects.title')
                                        }
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>Judul Mapel</span>
                                            {filters.sort ===
                                                'subjects.title' &&
                                                (filters.direction === 'asc' ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                ))}
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleSort('users.name')}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>Nama Pengajar</span>
                                            {filters.sort === 'users.name' &&
                                                (filters.direction === 'asc' ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                ))}
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            handleSort('subjects.created_at')
                                        }
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span>Tanggal Dibuat</span>
                                            {filters.sort ===
                                                'subjects.created_at' &&
                                                (filters.direction === 'asc' ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                ))}
                                        </div>
                                    </DropdownMenuItem>
                                    <div className="my-1 border-t" />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                '/teacher/subjects',
                                                {},
                                                { replace: true },
                                            );
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        <span>Reset Filter</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {auth.user.role === 'guru' ? (
                            <Button
                                className="h-10 w-full gap-2 shadow-lg shadow-primary/20 sm:w-auto"
                                asChild
                            >
                                <Link href="/teacher/subjects/create">
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Mapel</span>
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>

                {subjects.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {subjects.data.map((subject, index) => (
                                <motion.div
                                    key={subject.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="group flex h-full flex-col overflow-hidden border-none bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:shadow-xl">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="-mr-2 h-8 w-8"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-40"
                                                    >
                                                        <DropdownMenuItem
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/teacher/subjects/${subject.id}`}
                                                            >
                                                                <BookCheck className="mr-2 h-4 w-4" />
                                                                <span>
                                                                    Lihat Detail
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {(auth.user.role ===
                                                            'admin' ||
                                                            (auth.user.role ===
                                                                'guru' &&
                                                                auth.user.id ===
                                                                    subject.teacher_id)) && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`/teacher/subjects/${subject.id}/edit`}
                                                                    >
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        <span>
                                                                            Edit
                                                                            Mapel
                                                                        </span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    <span>
                                                                        Hapus
                                                                        Mapel
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="pt-2">
                                                <h3 className="line-clamp-1 text-lg leading-tight font-bold transition-colors group-hover:text-primary">
                                                    {subject.title}
                                                </h3>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 pb-4">
                                            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                {subject.description ||
                                                    'Tidak ada deskripsi untuk mata pelajaran ini.'}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex flex-col items-start gap-4 border-t border-zinc-100 bg-muted/20 pt-4 dark:border-zinc-800">
                                            <div className="flex w-full items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
                                                        <User className="h-3 w-3" />
                                                    </div>
                                                    <span className="max-w-[120px] truncate font-medium">
                                                        {subject.teacher_name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        {new Date(
                                                            subject.created_at,
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                month: 'short',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/20 p-12 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-muted-foreground dark:bg-zinc-800">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold">
                            Mata Pelajaran Kosong
                        </h3>
                        <p className="mb-6 max-w-xs text-muted-foreground">
                            Belum ada mata pelajaran yang terdaftar. Mulai
                            dengan menambahkan mata pelajaran baru.
                        </p>
                        {auth.user.role === 'guru' ? (
                            <Button asChild>
                                <Link href="/teacher/subjects/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Mapel
                                </Link>
                            </Button>
                        ) : null}
                    </Card>
                )}

                {/* Pagination */}
                {subjects.total > subjects.data.length && (
                    <div className="flex items-center justify-between rounded-xl border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan{' '}
                            <span className="font-bold text-foreground">
                                {subjects.from || 0}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-bold text-foreground">
                                {subjects.to || 0}
                            </span>{' '}
                            dari{' '}
                            <span className="font-bold text-foreground">
                                {subjects.total}
                            </span>{' '}
                            mapel
                        </p>
                        <div className="flex items-center gap-1">
                            {subjects.links.map((link, i) => {
                                const label = link.label.toLowerCase();
                                const isPrev =
                                    label.includes('previous') ||
                                    label.includes('&laquo;');
                                const isNext =
                                    label.includes('next') ||
                                    label.includes('&raquo;');
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
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size={
                                            isPrev || isNext
                                                ? 'default'
                                                : 'icon'
                                        }
                                        className={`h-8 ${isPrev || isNext ? 'px-3' : 'w-8'} text-xs`}
                                        asChild={!!link.url}
                                        disabled={!link.url || link.active}
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                            >
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
            </div>
        </>
    );
}
