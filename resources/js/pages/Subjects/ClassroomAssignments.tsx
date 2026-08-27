import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckSquare,
    Plus,
    Copy,
    Check,
    X,
    Eye,
    Trash2,
    School,
    Clock,
    Award,
    Users,
    MoreVertical,
    Pencil,
    AlertCircle,
    Search,
    Filter,
    ArrowUpDown,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
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
import { cn } from '@/lib/utils';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface Classroom {
    id: string;
    name: string;
    grade: string;
    section: string;
    academic_year: string;
}

interface Assignment {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    max_score: number;
    status: 'draft' | 'published' | 'archived';
    submissions_count?: number;
    created_at: string;
}

interface OtherAssignment {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    max_score: number;
    classroom_name: string;
}

interface Props {
    subject: Subject;
    classroom: Classroom;
    assignments: Assignment[];
    otherClassroomAssignments: OtherAssignment[];
}

const StatusBadge = ({ status }: { status: Assignment['status'] }) => {
    const labels = {
        draft: 'Draft',
        published: 'Terbit',
        archived: 'Arsip',
    };

    const colors = {
        draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        archived: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
    };

    return (
        <Badge variant="outline" className={cn('border-none font-semibold text-[10px]', colors[status])}>
            {labels[status] || status}
        </Badge>
    );
};

export default function ClassroomAssignments({
    subject,
    classroom,
    assignments,
    otherClassroomAssignments,
}: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [selectedCopyIds, setSelectedCopyIds] = useState<string[]>([]);
    const [isSubmittingCopy, setIsSubmittingCopy] = useState(false);

    // Search, Filter, & Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'title_asc' | 'title_desc'>('created_at_desc');

    // Delete modal state
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const flashMessage = flash?.success || flash?.error;
    const showSuccess = Boolean(flashMessage && dismissedFlash !== flashMessage);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setDismissedFlash(flashMessage);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Mata Pelajaran', href: '/teacher/subjects' },
                { title: subject.title, href: `/teacher/subjects/${subject.id}?tab=assignments` },
                { title: `Tugas Kelas ${classroom.name}`, href: '#' },
            ],
        });
    }, [subject.id, subject.title, classroom.name]);

    // Filter & Sort Logic
    const filteredAssignments = useMemo(() => {
        let list = [...assignments];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    (a.description && a.description.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== 'all') {
            list = list.filter((a) => a.status === statusFilter);
        }

        list.sort((a, b) => {
            if (sortBy === 'created_at_desc') {
                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            }

            if (sortBy === 'created_at_asc') {
                return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
            }

            if (sortBy === 'title_asc') {
                return a.title.localeCompare(b.title);
            }

            if (sortBy === 'title_desc') {
                return b.title.localeCompare(a.title);
            }

            return 0;
        });

        return list;
    }, [assignments, searchQuery, statusFilter, sortBy]);

    const toggleCopySelect = (id: string) => {
        if (selectedCopyIds.includes(id)) {
            setSelectedCopyIds(selectedCopyIds.filter((item) => item !== id));
        } else {
            setSelectedCopyIds([...selectedCopyIds, id]);
        }
    };

    const handleCopySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCopyIds.length === 0) {
return;
}

        setIsSubmittingCopy(true);
        router.post(
            `/teacher/subjects/${subject.id}/classrooms/${classroom.id}/assignments/copy`,
            { assignment_ids: selectedCopyIds },
            {
                onSuccess: () => {
                    setIsCopyModalOpen(false);
                    setSelectedCopyIds([]);
                    setIsSubmittingCopy(false);
                },
                onError: () => {
                    setIsSubmittingCopy(false);
                },
            }
        );
    };

    const handleDeleteAssignment = () => {
        if (!assignmentToDelete) {
return;
}

        setIsDeleting(true);

        router.delete(`/teacher/assignments/${assignmentToDelete.id}`, {
            onSuccess: () => {
                setAssignmentToDelete(null);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title={`Tugas ${subject.title} - ${classroom.name}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Flash Banner */}
                <AnimatePresence>
                    {showSuccess && (flash?.success || flash?.error) && (
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
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDismissedFlash(flashMessage)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Back Button Positioned on LEFT with Tab Memory */}
                <div>
                    <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 text-xs">
                        <Link href={`/teacher/subjects/${subject.id}?tab=assignments`}>
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Detail Mapel</span>
                        </Link>
                    </Button>
                </div>

                {/* Page Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold border-blue-200">
                                <School className="h-3 w-3 mr-1" />
                                Rombel: {classroom.name}
                            </Badge>
                            <Badge variant="outline" className="font-mono">
                                Mapel: {subject.code}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Tugas Siswa - {subject.title}
                        </h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Kelola penugasan khusus untuk kelas {classroom.name} (T.A {classroom.academic_year}).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {otherClassroomAssignments.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setIsCopyModalOpen(true)}
                                className="h-9 gap-1.5 text-xs"
                            >
                                <Copy className="h-3.5 w-3.5 text-primary" />
                                <span>Salin dari Kelas Lain</span>
                            </Button>
                        )}

                        <Button size="sm" className="h-9 gap-1.5 shadow-md shadow-primary/20 text-xs" asChild>
                            <Link href={`/teacher/assignments/create?subject_id=${subject.id}&classroom_id=${classroom.id}`}>
                                <Plus className="h-4 w-4" />
                                <span>Buat Tugas Baru</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search, Filter, & Sort Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/30 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari tugas siswa..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1 bg-background text-xs">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer pr-2"
                            >
                                <option value="all">Semua Status</option>
                                <option value="published">Terbit</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1 bg-background text-xs">
                            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer pr-2"
                            >
                                <option value="created_at_desc">Terbaru</option>
                                <option value="created_at_asc">Terlama</option>
                                <option value="title_asc">Judul (A-Z)</option>
                                <option value="title_desc">Judul (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Assignments List Table */}
                <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Judul Tugas
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Tenggat & Nilai
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Pengumpulan
                                    </th>
                                    <th className="p-4 text-right font-bold text-muted-foreground uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredAssignments.length > 0 ? (
                                    filteredAssignments.map((assignment, index) => (
                                        <motion.tr
                                            key={assignment.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => router.get(`/teacher/assignments/${assignment.id}`)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <CheckSquare className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold truncate group-hover:text-primary transition-colors">
                                                            {assignment.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                            {assignment.description || 'Tidak ada deskripsi.'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={assignment.status} />
                                            </td>
                                            <td className="p-4 text-xs">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {assignment.due_date
                                                            ? new Date(assignment.due_date).toLocaleString('id-ID', {
                                                                  day: 'numeric',
                                                                  month: 'short',
                                                                  year: 'numeric',
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              })
                                                            : 'Tanpa tenggat'}
                                                    </span>
                                                    <span className="flex items-center gap-1 font-medium">
                                                        <Award className="h-3.5 w-3.5 text-amber-500" /> Max: {assignment.max_score}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span className="font-medium">{assignment.submissions_count ?? 0} Pengumpulan</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/assignments/${assignment.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4 text-primary" /> Detail & Nilai
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                                                                    <Pencil className="mr-2 h-4 w-4 text-primary" /> Edit Tugas
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={() => setAssignmentToDelete(assignment)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus Tugas
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-muted-foreground italic">
                                            {searchQuery || statusFilter !== 'all'
                                                ? 'Tidak ada tugas yang sesuai dengan pencarian/filter.'
                                                : 'Belum ada tugas siswa khusus untuk kelas ini.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal Salin Tugas dari Kelas Lain */}
            <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Copy className="h-5 w-5 text-primary" />
                            Salin Tugas dari Kelas Lain
                        </DialogTitle>
                        <DialogDescription>
                            Pilih tugas dari kelas lain untuk disalin ke kelas <strong>{classroom.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCopySubmit} className="space-y-4 pt-2">
                        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                            {otherClassroomAssignments.map((a) => {
                                const isSelected = selectedCopyIds.includes(a.id);

                                return (
                                    <div
                                        key={a.id}
                                        onClick={() => toggleCopySelect(a.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-primary/50 bg-primary/5 font-semibold'
                                                : 'border-zinc-200/80 bg-background hover:bg-muted/50 dark:border-zinc-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="rounded border-zinc-300 text-primary focus:ring-primary"
                                            />
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className="text-[10px] uppercase">
                                                        {a.classroom_name}
                                                    </Badge>
                                                    <p className="text-xs font-bold text-foreground">
                                                        {a.title}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                                    Max Skor: {a.max_score}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCopyModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingCopy || selectedCopyIds.length === 0}
                                className="shadow-lg shadow-primary/20"
                            >
                                Salin {selectedCopyIds.length > 0 ? `${selectedCopyIds.length} ` : ''}Tugas Sekarang
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Delete Assignment */}
            <Dialog open={!!assignmentToDelete} onOpenChange={(open) => !open && setAssignmentToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle>Hapus Tugas</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus tugas <span className="font-bold text-foreground">{assignmentToDelete?.title}</span>? Tindakan ini permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setAssignmentToDelete(null)} disabled={isDeleting}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAssignment} disabled={isDeleting} className="gap-2">
                            {isDeleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
                            Hapus Tugas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
