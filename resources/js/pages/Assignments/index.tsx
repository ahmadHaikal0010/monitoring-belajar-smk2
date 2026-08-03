import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ClipboardList,
    Plus,
    X,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    Calendar,
    Clock,
    Award,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Users,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface Assignment {
    id: string;
    subject_id: string;
    teacher_id: string;
    title: string;
    description: string;
    due_date: string | null;
    max_score: number;
    allowed_file_types: string[] | null;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    subject?: Subject;
    teacher?: {
        id: string;
        user?: {
            name: string;
        };
    };
    submissions_count?: number;
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
}

interface Props {
    assignments: PaginatedData<Assignment>;
    subjects: Subject[];
    filters: {
        search?: string;
        subject_id?: string;
        status?: string;
    };
}

export default function AssignmentIndex({ assignments, subjects, filters }: Props) {
    const { auth, flash } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search || '');
    const [showFlash, setShowFlash] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Manajemen Tugas',
                href: '/teacher/assignments',
            },
        ],
    });

    const handleDelete = () => {
        if (!assignmentToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(`/teacher/assignments/${assignmentToDelete.id}`, {
            onSuccess: () => {
                setAssignmentToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/teacher/assignments',
                { ...filters, search: value, page: 1 },
                { preserveState: true, replace: true }
            );
        },
        [filters]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleSearch(search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, handleSearch, filters.search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(search);
    };

    const handleSubjectFilter = (subjectId: string) => {
        router.get(
            '/teacher/assignments',
            { ...filters, subject_id: subjectId === filters.subject_id ? '' : subjectId, page: 1 },
            { preserveState: true }
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            published: { label: 'Terbit', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
            draft: { label: 'Draft', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
            archived: { label: 'Arsip', className: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/20' },
        };

        const v = variants[status] || { label: status, className: '' };

        return (
            <Badge variant="outline" className={cn('font-medium text-xs', v.className)}>
                {v.label}
            </Badge>
        );
    };

    return (
        <>
            <Head title="Manajemen Tugas Siswa" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-between rounded-xl p-4 text-sm font-medium border shadow-sm',
                                    flash?.success
                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-destructive/20 bg-destructive/10 text-destructive'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {flash?.success ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5" />
                                    )}
                                    <p>{flash?.success || flash?.error}</p>
                                </div>
                                <button
                                    onClick={() => setShowFlash(false)}
                                    className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manajemen Tugas Siswa</h1>
                        <p className="text-muted-foreground text-sm">
                            Buat tugas, kelola berkas (Foto & PDF), dan berikan penilaian manual untuk siswa.
                        </p>
                    </div>

                    {auth?.user?.role === 'guru' && (
                        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
                            <Link href="/teacher/assignments/create">
                                <Plus className="h-4 w-4" />
                                <span>Buat Tugas Baru</span>
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari tugas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 border-zinc-200 bg-background/50 dark:border-zinc-800"
                        />
                    </form>

                    {subjects.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground mr-1">Mapel:</span>
                            <Button
                                variant={!filters.subject_id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleSubjectFilter('')}
                                className="h-8 text-xs"
                            >
                                Semua
                            </Button>
                            {subjects.map((sub) => (
                                <Button
                                    key={sub.id}
                                    variant={filters.subject_id === sub.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleSubjectFilter(sub.id)}
                                    className="h-8 text-xs"
                                >
                                    {sub.title}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* List Assignments */}
                {assignments.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {assignments.data.map((assignment) => (
                            <Card
                                key={assignment.id}
                                className="group flex flex-col justify-between overflow-hidden border-none bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                                onClick={() => router.visit(`/teacher/assignments/${assignment.id}`)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <ClipboardList className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <Badge variant="outline" className="text-[10px] font-mono">
                                                    {assignment.subject?.code || 'MAPEL'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            {getStatusBadge(assignment.status)}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/teacher/assignments/${assignment.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>Detail & Nilai</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {auth?.user?.role === 'guru' && (
                                                        <>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    <span>Edit Tugas</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => setAssignmentToDelete(assignment)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Hapus Tugas</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="line-clamp-2 text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
                                            {assignment.title}
                                        </h3>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 text-sm text-muted-foreground">
                                    <p className="line-clamp-2">
                                        {assignment.description || 'Tidak ada petunjuk deskripsi.'}
                                    </p>

                                    <div className="space-y-1.5 pt-2 text-xs">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 text-primary" />
                                            <span className="font-medium text-foreground">
                                                {assignment.subject?.title}
                                            </span>
                                        </div>
                                        {assignment.due_date ? (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                <span>
                                                    Tenggat:{' '}
                                                    {new Date(assignment.due_date).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>Tidak ada tenggat waktu</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Award className="h-3.5 w-3.5 text-emerald-500" />
                                            <span>Nilai Maksimal: {assignment.max_score}</span>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex items-center justify-between border-t border-zinc-100 bg-muted/20 px-6 py-3 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>
                                            <strong className="text-foreground font-semibold">
                                                {assignment.submissions_count || 0}
                                            </strong>{' '}
                                            Pengumpulan
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild className="h-8 text-xs font-semibold">
                                        <Link href={`/teacher/assignments/${assignment.id}`}>
                                            Lihat Hasil →
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                        <ClipboardList className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                        <h3 className="font-semibold text-lg">Belum Ada Tugas</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                            Belum ada tugas yang ditambahkan. Klik tombol di bawah untuk membuat tugas baru.
                        </p>
                        {auth?.user?.role === 'guru' && (
                            <Button asChild>
                                <Link href="/teacher/assignments/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Tugas
                                </Link>
                            </Button>
                        )}
                    </Card>
                )}
            </div>

            {/* Dialog Hapus Tugas */}
            <Dialog open={Boolean(assignmentToDelete)} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Tugas</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus tugas{' '}
                            <strong>"{assignmentToDelete?.title}"</strong>? Semua berkas pengumpulan siswa untuk tugas ini juga akan terhapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setAssignmentToDelete(null)}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus Tugas'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
