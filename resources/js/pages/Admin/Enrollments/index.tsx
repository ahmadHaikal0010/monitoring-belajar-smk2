import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    BookOpen,
    User,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    CheckCircle2,
    Clock,
    ArrowLeft,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
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

interface Enrollment {
    id: string;
    status: 'enrolled' | 'completed' | 'dropped';
    enrolled_at: string;
    student_name: string;
    student_email: string;
    student_nisn: string;
    subject_title: string;
    subject_code: string;
    teacher_name: string;
}

interface Subject {
    id: string;
    title: string;
    code: string;
    description: string;
    teacher_name: string;
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
    subject_id?: string;
}

interface Props {
    enrollments?: PaginatedData<Enrollment>;
    subjects?: PaginatedData<Subject>;
    selectedSubject?: Subject;
    filters: Filters;
    mode: 'subjects' | 'enrollments';
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

export default function EnrollmentList({ 
    enrollments, 
    subjects, 
    selectedSubject, 
    filters, 
    mode 
}: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [showSuccess, setShowSuccess] = useState(false);
    const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            const showTimer = setTimeout(() => setShowSuccess(true), 0);
            const hideTimer = setTimeout(() => setShowSuccess(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.success]);

    const handleDelete = () => {
        if (!enrollmentToDelete) {
return;
}

        setIsDeleting(true);
        router.delete(`/admin/enrollments/${enrollmentToDelete.id}`, {
            onSuccess: () => {
                setEnrollmentToDelete(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Data Pendaftaran',
                href: '/admin/enrollments',
            },
            ...(selectedSubject ? [{
                title: selectedSubject.title,
                href: `/admin/enrollments?subject_id=${selectedSubject.id}`,
            }] : []),
        ],
    });

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/enrollments',
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
            '/admin/enrollments',
            { ...filters, sort: field, direction },
            { preserveState: true },
        );
    };

    const handleStatusFilter = (status: string | null) => {
        router.get(
            '/admin/enrollments',
            { ...filters, status, page: 1 },
            { preserveState: true },
        );
    };

    const getStatusBadge = (status: Enrollment['status']) => {
        switch (status) {
            case 'enrolled':
                return (
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 font-bold text-[10px]">
                        AKTIF
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-[10px]">
                        SELESAI
                    </Badge>
                );
            case 'dropped':
                return (
                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 font-bold text-[10px]">
                        KELUAR
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Head title={mode === 'subjects' ? "Pilih Mata Pelajaran" : `Pendaftaran: ${selectedSubject?.title}`} />

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
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="flex-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                                    {flash.success}
                                </div>
                                <button onClick={() => setShowSuccess(false)} className="text-emerald-600 dark:text-emerald-400 hover:opacity-70 transition-opacity">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        {mode === 'enrollments' && (
                            <Button variant="outline" size="icon" asChild className="shrink-0 h-10 w-10">
                                <Link href="/admin/enrollments">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {mode === 'subjects' ? "Pendaftaran Siswa" : selectedSubject?.title}
                            </h1>
                            <p className="text-muted-foreground">
                                {mode === 'subjects' 
                                    ? "Pilih mata pelajaran untuk melihat daftar siswa yang terdaftar." 
                                    : `Daftar siswa yang terdaftar pada kelas ${selectedSubject?.title}.`}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <div className="flex w-full items-center gap-3 sm:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={mode === 'subjects' ? "Cari mata pelajaran..." : "Cari nama siswa atau NISN..."}
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            
                            {mode === 'enrollments' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <div className="p-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">Filter Status</div>
                                        <DropdownMenuItem onClick={() => handleStatusFilter(null)}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>Semua Status</span>
                                                {!filters.status && <CheckCircle2 className="h-3 w-3 text-primary" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusFilter('enrolled')}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>Aktif</span>
                                                {filters.status === 'enrolled' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusFilter('completed')}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>Selesai</span>
                                                {filters.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                                            </div>
                                        </DropdownMenuItem>
                                        <div className="my-1 border-t" />
                                        <DropdownMenuItem onClick={() => {
                                            setSearch('');
                                            router.get('/admin/enrollments', { subject_id: filters.subject_id }, { replace: true });
                                        }} className="text-destructive focus:text-destructive">
                                            <X className="mr-2 h-4 w-4" />
                                            <span>Reset Filter</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>

                {mode === 'subjects' ? (
                    /* VIEW 1: SUBJECT LIST */
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {subjects?.data.length ? (
                            subjects.data.map((subject, index) => (
                                <motion.div
                                    key={subject.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card 
                                        className="group cursor-pointer border-none bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:translate-y-[-4px] hover:shadow-xl active:scale-[0.98]"
                                        onClick={() => router.get('/admin/enrollments', { subject_id: subject.id })}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                        <BookOpen className="h-5 w-5" />
                                                    </div>
                                                    <Badge variant="outline" className="w-fit font-mono text-[10px] font-bold">
                                                        #{subject.code}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <h3 className="line-clamp-1 text-lg font-bold group-hover:text-primary transition-colors">
                                                    {subject.title}
                                                </h3>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pb-4">
                                            <p className="line-clamp-2 text-sm text-muted-foreground">
                                                {subject.description || 'Tidak ada deskripsi.'}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="border-t border-zinc-100 bg-muted/20 pt-4 dark:border-zinc-800">
                                            <div className="flex w-full items-center gap-2 text-xs text-muted-foreground">
                                                <User className="h-3 w-3" />
                                                <span className="truncate">{subject.teacher_name}</span>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                Tidak ada mata pelajaran yang ditemukan.
                            </div>
                        )}
                    </div>
                ) : (
                    /* VIEW 2: ENROLLMENT LIST TABLE */
                    <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                        <th className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary" onClick={() => handleSort('student_users.name')}>
                                            <div className="flex items-center">
                                                Siswa <SortIcon field="student_users.name" currentSort={filters.sort} direction={filters.direction} />
                                            </div>
                                        </th>
                                        <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                            Informasi Akademik
                                        </th>
                                        <th className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary" onClick={() => handleSort('enrollments.status')}>
                                            <div className="flex items-center">
                                                Status <SortIcon field="enrollments.status" currentSort={filters.sort} direction={filters.direction} />
                                            </div>
                                        </th>
                                        <th className="cursor-pointer p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary" onClick={() => handleSort('enrollments.enrolled_at')}>
                                            <div className="flex items-center">
                                                Tgl Daftar <SortIcon field="enrollments.enrolled_at" currentSort={filters.sort} direction={filters.direction} />
                                            </div>
                                        </th>
                                        <th className="p-4 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {enrollments?.data.length ? (
                                        enrollments.data.map((enrollment, index) => (
                                            <motion.tr
                                                key={enrollment.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="group transition-colors hover:bg-muted/30"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                            <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                                                                {enrollment.student_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{enrollment.student_name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{enrollment.student_email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="outline" className="font-mono text-[10px] font-bold">
                                                        NISN: {enrollment.student_nisn}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(enrollment.status)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {new Date(enrollment.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setEnrollmentToDelete(enrollment)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                                                Belum ada siswa yang mendaftar di mata pelajaran ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {((mode === 'subjects' ? subjects?.total : enrollments?.total) ?? 0) > 0 && (
                    <div className="flex items-center justify-between border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800">
                        <p className="text-xs text-muted-foreground">
                            Menampilkan <span className="font-bold text-foreground">{(mode === 'subjects' ? subjects?.from : enrollments?.from) || 0}</span> sampai <span className="font-bold text-foreground">{(mode === 'subjects' ? subjects?.to : enrollments?.to) || 0}</span> dari <span className="font-bold text-foreground">{(mode === 'subjects' ? subjects?.total : enrollments?.total) || 0}</span> data
                        </p>
                        <div className="flex items-center gap-1">
                            {(mode === 'subjects' ? subjects : enrollments)?.links.map((link, i) => {
                                const label = link.label.toLowerCase();
                                const isPrev = label.includes('previous') || label.includes('prev') || label.includes('&laquo;') || label.includes('pagination.previous');
                                const isNext = label.includes('next') || label.includes('&raquo;') || label.includes('pagination.next');
                                
                                if (link.label === '...') {
return <div key={i} className="px-2 text-xs">...</div>;
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
                                                {isPrev ? 'Sebelumnya' : isNext ? 'Selanjutnya' : link.label}
                                            </Link>
                                        ) : (
                                            <span className="opacity-50">{isPrev ? 'Sebelumnya' : isNext ? 'Selanjutnya' : link.label}</span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={!!enrollmentToDelete}
                    onOpenChange={(open) => !open && setEnrollmentToDelete(null)}
                >
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-6 w-6 text-destructive" />
                            </div>
                            <DialogTitle>Batalkan Pendaftaran</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin membatalkan pendaftaran siswa{' '}
                                <span className="font-bold text-foreground break-all">
                                    {enrollmentToDelete?.student_name}
                                </span>{' '}
                                dari mata pelajaran{' '}
                                <span className="font-bold text-foreground">
                                    {enrollmentToDelete?.subject_title}
                                </span>
                                ? Tindakan ini akan menghapus akses siswa tersebut ke materi kelas ini.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                onClick={() => setEnrollmentToDelete(null)}
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
                                Hapus Pendaftaran
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
