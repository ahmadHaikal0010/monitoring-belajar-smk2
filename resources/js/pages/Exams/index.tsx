import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileQuestion,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    CheckCircle2,
    AlertCircle,
    User,
    ArrowLeft,
    Clock,
    Award,
    HelpCircle,
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
    teacher_id: string;
    teacher_user_id: number;
    title: string;
    code: string;
    description: string;
    teacher_name: string;
    created_at: string;
}

interface Exam {
    id: string;
    subject_id: string;
    title: string;
    description: string;
    duration: number;
    pass_score: number;
    status: 'draft' | 'published' | 'archived';
    question_count: number;
    session_count: number;
    created_at: string;
    subject_title: string;
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
    subject_id?: string;
    status?: string;
}

interface Props {
    exams?: PaginatedData<Exam>;
    subjects?: PaginatedData<Subject>;
    selectedSubject?: Subject;
    filters: Filters;
    mode: 'subjects' | 'exams';
}

const StatusBadge = ({ status }: { status: Exam['status'] }) => {
    const labels = {
        draft: 'Draft',
        published: 'Diterbitkan',
        archived: 'Diarsipkan',
    };

    const colors = {
        draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        archived: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    };

    return (
        <Badge variant="outline" className={cn("border-none font-semibold text-[10px]", colors[status])}>
            {labels[status] || status}
        </Badge>
    );
};

export default function ExamIndex({ exams, subjects, selectedSubject, filters, mode }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState(filters?.search || '');
    const [showFlash, setShowFlash] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!examToDelete) {
            return;
        }

        setIsDeleting(true);
        router.delete(`/teacher/exams/${examToDelete.id}`, {
            onSuccess: () => {
                setExamToDelete(null);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                if (showTimer) {
clearTimeout(showTimer);
}

                if (hideTimer) {
clearTimeout(hideTimer);
}
            };
        }
    }, [flash?.success, flash?.error]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Manajemen Ujian',
                href: '/teacher/exams',
            },
            ...(mode === 'exams' && selectedSubject ? [{
                title: selectedSubject.title,
                href: `/teacher/exams?subject_id=${selectedSubject.id}`,
            }] : []),
        ],
    });

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/teacher/exams',
                { ...filters, search: value, page: 1 },
                { preserveState: true, replace: true },
            );
        },
        [filters],
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                handleSearch(search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, handleSearch, filters?.search]);

    const handleSubjectSelect = (subjectId: string) => {
        router.get('/teacher/exams', { ...filters, subject_id: subjectId, page: 1, search: '' });
    };

    const renderPagination = (data?: PaginatedData<any>) => {
        if (!data || !data.data || data.total <= data.data.length) {
            return null;
        }

        return (
            <div className="flex items-center justify-between border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800 rounded-b-xl">
                <p className="text-xs text-muted-foreground">
                    Menampilkan <span className="font-bold text-foreground">{data.from || 0}</span> sampai <span className="font-bold text-foreground">{data.to || 0}</span> dari <span className="font-bold text-foreground">{data.total}</span> data
                </p>
                <div className="flex items-center gap-1">
                    {data?.links?.map((link, i) => {
                        const label = link.label.toLowerCase();
                        const isPrev = label.includes('previous') || label.includes('prev') || label.includes('&laquo;') || label.includes('pagination.previous');
                        const isNext = label.includes('next') || label.includes('&raquo;') || label.includes('pagination.next');
                        const isEllipsis = link.label === '...';

                        if (isEllipsis) {
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
                                        {isPrev && <ChevronLeft className="mr-1 h-4 w-4" />}
                                        {isPrev ? 'Sebelumnya' : isNext ? 'Selanjutnya' : link.label}
                                        {isNext && <ChevronRight className="ml-1 h-4 w-4" />}
                                    </Link>
                                ) : (
                                    <span className="flex items-center px-2 opacity-50">
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
        );
    };

    return (
        <>
            <Head title={mode === 'subjects' ? "Pilih Mata Pelajaran - Ujian" : `Ujian: ${selectedSubject?.title}`} />

            <div className="flex flex-col gap-6 p-6">
                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className={cn(
                                "mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm",
                                flash?.success 
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                            )}>
                                {flash?.success ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                )}
                                <div className="flex-1 text-sm font-medium">
                                    {flash?.success || flash?.error}
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
                        <div className="flex items-center gap-3">
                            {mode === 'exams' && (
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => router.get('/teacher/exams')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <h1 className="text-3xl font-bold tracking-tight">
                                {mode === 'subjects' ? "Manajemen Ujian" : selectedSubject?.title}
                            </h1>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {mode === 'subjects' 
                                ? "Pilih mata pelajaran untuk mengelola atau membuat ujian." 
                                : `Daftar ujian untuk mata pelajaran ${selectedSubject?.title}.`}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <div className="flex w-full items-center gap-3 sm:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={mode === 'subjects' ? "Cari mata pelajaran..." : "Cari ujian..."}
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {mode === 'exams' && selectedSubject && (
                            <Button className="h-10 w-full gap-2 shadow-lg shadow-primary/20 sm:w-auto" asChild>
                                <Link href={`/teacher/exams/create?subject_id=${selectedSubject?.id}`}>
                                    <Plus className="h-4 w-4" />
                                    <span>Buat Ujian Baru</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {mode === 'subjects' ? (
                    <div className="space-y-6">
                        {subjects && subjects?.data?.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {subjects.data.map((subject, index) => (
                                    <motion.div
                                        key={subject.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card 
                                            className="group h-full cursor-pointer overflow-hidden border-none bg-card/50 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl hover:translate-y-[-2px] active:scale-[0.98]"
                                            onClick={() => handleSubjectSelect(subject.id)}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <FileQuestion className="h-5 w-5" />
                                                </div>
                                                <div className="pt-2">
                                                    <h3 className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                                        {subject?.title}
                                                    </h3>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 pb-4 text-sm text-muted-foreground line-clamp-3">
                                                {subject?.description || 'Tidak ada deskripsi.'}
                                            </CardContent>
                                            <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 bg-muted/20 text-xs text-muted-foreground flex justify-between">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3" />
                                                    <span className="truncate max-w-[100px]">{subject?.teacher_name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 font-medium text-primary">
                                                    <span>Kelola Ujian</span>
                                                    <ChevronRight className="h-3 w-3" />
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 text-center border-dashed border-2 bg-muted/20">
                                <p className="text-muted-foreground italic text-sm">Tidak ada mata pelajaran ditemukan.</p>
                            </Card>
                        )}
                        {subjects && renderPagination(subjects)}
                    </div>
                ) : (
                    <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Judul Ujian</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Durasi & KKM</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Soal & Peserta</th>
                                        <th className="p-4 text-right font-bold text-muted-foreground uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {exams && exams?.data?.length > 0 ? (
                                        exams.data.map((exam, index) => (
                                            <motion.tr
                                                key={exam.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => router.get(`/teacher/exams/${exam.id}`)}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <FileQuestion className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-semibold truncate group-hover:text-primary transition-colors">{exam?.title}</span>
                                                            <span className="text-xs text-muted-foreground truncate max-w-[300px]">{exam?.description || 'Tanpa deskripsi'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4"><StatusBadge status={exam.status} /></td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {exam.duration} menit</span>
                                                        <span className="flex items-center gap-1 font-medium"><Award className="h-3.5 w-3.5 text-amber-500" /> KKM: {exam.pass_score}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex items-center gap-4">
                                                        <span className="flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5 text-blue-500" /> {exam.question_count} Soal</span>
                                                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-emerald-500" /> {exam.session_count} Sesi</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem asChild><Link href={`/teacher/exams/${exam.id}`}><Eye className="mr-2 h-4 w-4 text-primary" /> Bank Soal</Link></DropdownMenuItem>
                                                                <DropdownMenuItem asChild><Link href={`/teacher/exams/${exam.id}/edit`}><Pencil className="mr-2 h-4 w-4 text-primary" /> Edit Ujian</Link></DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setExamToDelete(exam)}><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">Belum ada ujian pada mata pelajaran ini.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {exams && renderPagination(exams)}
                    </Card>
                )}

                <Dialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"><AlertCircle className="h-6 w-6 text-destructive" /></div>
                            <DialogTitle>Hapus Ujian</DialogTitle>
                            <DialogDescription>Apakah Anda yakin ingin menghapus ujian <span className="font-bold text-foreground">{examToDelete?.title}</span>? Seluruh soal dan data sesi pengerjaan siswa terkait akan terhapus.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setExamToDelete(null)} disabled={isDeleting}>Batal</Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
                                {isDeleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
                                Hapus Ujian
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
