import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    MoreVertical,
    Mail,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    UserPlus,
    Check,
    X,
    Pencil,
    Trash2,
    AlertTriangle,
    Eye,
    MapPin,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import admin from '@/routes/admin';

interface Student {
    id: string;
    nisn: string;
    address: string;
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
    students: PaginatedData<Student>;
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

export default function StudentList({ students, filters }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [showSuccess, setShowSuccess] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!studentToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(admin.students.destroy.url(studentToDelete.id), {
            onSuccess: () => {
                setStudentToDelete(null);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    useEffect(() => {
        let hideTimer: ReturnType<typeof setTimeout>;
        let showTimer: ReturnType<typeof setTimeout>;

        if (flash?.success) {
            showTimer = setTimeout(() => {
                setShowSuccess(true);
            }, 0);

            hideTimer = setTimeout(() => {
                setShowSuccess(false);
            }, 5000);
        }

        return () => {
            if (showTimer) {
                clearTimeout(showTimer);
            }

            if (hideTimer) {
                clearTimeout(hideTimer);
            }
        };
    }, [flash?.success]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Daftar Siswa',
                href: admin.students.index.url(),
            },
        ],
    });

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                admin.students.index.url(),
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
            admin.students.index.url(),
            { ...filters, sort: field, direction },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Daftar Siswa" />

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
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                        {flash.success}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowSuccess(false)}
                                    className="rounded-lg p-1 text-emerald-600 transition-colors hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Daftar Siswa
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola semua data profil siswa dalam satu tempat.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <div className="flex w-full items-center gap-3 sm:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau NISN..."
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800"
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
                                    router.get(
                                        admin.students.index.url(),
                                        {},
                                        { replace: true },
                                    );
                                }}
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>

                        <Button
                            className="h-10 w-full gap-2 shadow-lg shadow-primary/20 sm:w-auto"
                            asChild
                        >
                            <Link href={admin.students.create.url()}>
                                <UserPlus className="h-4 w-4" />
                                <span>Tambah Siswa Baru</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                    <th
                                        className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
                                        onClick={() => handleSort('users.name')}
                                    >
                                        <div className="flex items-center">
                                            Siswa{' '}
                                            <SortIcon
                                                field="users.name"
                                                currentSort={filters.sort}
                                                direction={filters.direction}
                                            />
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
                                        onClick={() =>
                                            handleSort('students.nisn')
                                        }
                                    >
                                        <div className="flex items-center">
                                            Informasi Siswa{' '}
                                            <SortIcon
                                                field="students.nisn"
                                                currentSort={filters.sort}
                                                direction={filters.direction}
                                            />
                                        </div>
                                    </th>
                                    <th
                                        className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
                                        onClick={() =>
                                            handleSort('students.created_at')
                                        }
                                    >
                                        <div className="flex items-center">
                                            Terdaftar{' '}
                                            <SortIcon
                                                field="students.created_at"
                                                currentSort={filters.sort}
                                                direction={filters.direction}
                                            />
                                        </div>
                                    </th>
                                    <th className="p-4 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {students.data.length > 0 ? (
                                    students.data.map((student, index) => (
                                        <motion.tr
                                            key={student.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                        <AvatarImage
                                                            src={
                                                                student.photo_url
                                                            }
                                                            alt={
                                                                student.user_name
                                                            }
                                                        />
                                                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                            {student.user_name.charAt(
                                                                0,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold transition-colors group-hover:text-primary">
                                                            {student.user_name}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3" />
                                                            {student.user_email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="h-5 w-fit border-zinc-200 bg-muted/50 py-0 text-[10px] font-bold dark:border-zinc-800"
                                                    >
                                                        NISN: {student.nisn}
                                                    </Badge>
                                                    <span className="flex items-center gap-1 text-xs font-medium text-foreground truncate max-w-[200px]">
                                                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        {student.address}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {new Date(
                                                            student.created_at,
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] font-bold tracking-tighter text-muted-foreground uppercase">
                                                        {new Date(
                                                            student.created_at,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        )}{' '}
                                                        WIB
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-48"
                                                    >
                                                        <DropdownMenuItem
                                                            className="flex cursor-pointer items-center gap-2"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={admin.students.show.url(
                                                                    student.id,
                                                                )}
                                                            >
                                                                <Eye className="h-4 w-4 text-primary" />
                                                                <span>
                                                                    Lihat Detail
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="flex cursor-pointer items-center gap-2"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={admin.students.edit.url(
                                                                    student.id,
                                                                )}
                                                            >
                                                                <Pencil className="h-4 w-4 text-primary" />
                                                                <span>
                                                                    Edit Profil
                                                                </span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                                                            onSelect={() =>
                                                                setStudentToDelete(
                                                                    student,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>
                                                                Hapus Profil
                                                            </span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-8 text-center text-muted-foreground italic"
                                        >
                                            Belum ada data siswa yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan{' '}
                            <span className="font-bold text-foreground">
                                {students.from || 0}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-bold text-foreground">
                                {students.to || 0}
                            </span>{' '}
                            dari{' '}
                            <span className="font-bold text-foreground">
                                {students.total}
                            </span>{' '}
                            siswa
                        </p>
                        <div className="flex items-center gap-1">
                            {students.links.map((link, i) => {
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
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size={
                                            isPrev || isNext
                                                ? 'default'
                                                : 'icon'
                                        }
                                        className={`h-8 ${isPrev || isNext ? 'px-3' : 'w-8'} text-xs transition-all`}
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
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={!!studentToDelete}
                    onOpenChange={(open) => !open && setStudentToDelete(null)}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <DialogTitle>Hapus Profil Siswa</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus profil siswa{' '}
                                <span className="font-bold text-foreground break-all">
                                    {studentToDelete?.user_name}
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan dan akan
                                memutuskan hubungan akun user dengan data siswa.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                onClick={() => setStudentToDelete(null)}
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="gap-2"
                            >
                                {isDeleting ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Hapus Profil
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
