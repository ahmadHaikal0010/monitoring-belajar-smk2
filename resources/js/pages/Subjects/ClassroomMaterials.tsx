import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Plus,
    Copy,
    Check,
    X,
    Eye,
    Trash2,
    School,
    Video,
    FileText,
    Link as LinkIcon,
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

interface Material {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    content_body?: string;
    description?: string;
    created_at: string;
}

interface OtherMaterial {
    id: string;
    title: string;
    content_type: string;
    description?: string;
    classroom_name: string;
}

interface Props {
    subject: Subject;
    classroom: Classroom;
    materials: Material[];
    otherClassroomMaterials: OtherMaterial[];
}

const TypeIcon = ({ type }: { type: Material['content_type'] }) => {
    switch (type) {
        case 'video':
            return <Video className="h-4 w-4 text-rose-500" />;
        case 'document':
            return <FileText className="h-4 w-4 text-blue-500" />;
        case 'url':
            return <LinkIcon className="h-4 w-4 text-emerald-500" />;
        default:
            return <FileText className="h-4 w-4" />;
    }
};

const TypeBadge = ({ type }: { type: Material['content_type'] }) => {
    const labels = {
        video: 'Video',
        document: 'Dokumen',
        url: 'Tautan',
    };

    const colors = {
        video: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        url: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    return (
        <Badge variant="outline" className={cn('border-none font-semibold text-[10px]', colors[type])}>
            {labels[type]}
        </Badge>
    );
};

export default function ClassroomMaterials({
    subject,
    classroom,
    materials,
    otherClassroomMaterials,
}: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [selectedCopyIds, setSelectedCopyIds] = useState<string[]>([]);
    const [isSubmittingCopy, setIsSubmittingCopy] = useState(false);

    // Search, Filter, & Sort States
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'document' | 'url'>('all');
    const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc' | 'title_asc' | 'title_desc'>('created_at_desc');

    // Delete dialog state
    const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
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
                { title: subject.title, href: `/teacher/subjects/${subject.id}?tab=materials` },
                { title: `Materi Kelas ${classroom.name}`, href: '#' },
            ],
        });
    }, [subject.id, subject.title, classroom.name]);

    // Filter & Sort Logic
    const filteredMaterials = useMemo(() => {
        let list = [...materials];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (m) =>
                    m.title.toLowerCase().includes(q) ||
                    (m.description && m.description.toLowerCase().includes(q))
            );
        }

        if (typeFilter !== 'all') {
            list = list.filter((m) => m.content_type === typeFilter);
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
    }, [materials, searchQuery, typeFilter, sortBy]);

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
            `/teacher/subjects/${subject.id}/classrooms/${classroom.id}/materials/copy`,
            { material_ids: selectedCopyIds },
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

    const handleDeleteMaterial = () => {
        if (!materialToDelete) {
return;
}

        setIsDeleting(true);

        router.delete(`/teacher/materials/${materialToDelete.id}`, {
            onSuccess: () => {
                setMaterialToDelete(null);
                setIsDeleting(false);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <Head title={`Materi ${subject.title} - ${classroom.name}`} />

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
                        <Link href={`/teacher/subjects/${subject.id}?tab=materials`}>
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
                            Materi Pembelajaran - {subject.title}
                        </h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Kelola materi khusus untuk kelas {classroom.name} (T.A {classroom.academic_year}).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {otherClassroomMaterials.length > 0 && (
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
                            <Link href={`/teacher/materials/create?subject_id=${subject.id}&classroom_id=${classroom.id}`}>
                                <Plus className="h-4 w-4" />
                                <span>Tambah Materi Baru</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search, Filter, & Sort Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card/30 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari materi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1 bg-background text-xs">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                                className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer pr-2"
                            >
                                <option value="all">Semua Jenis</option>
                                <option value="document">Dokumen</option>
                                <option value="video">Video</option>
                                <option value="url">Tautan</option>
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

                {/* Materials List Table */}
                <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Materi
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Jenis
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Dibuat
                                    </th>
                                    <th className="p-4 text-right font-bold text-muted-foreground uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredMaterials.length > 0 ? (
                                    filteredMaterials.map((material, index) => (
                                        <motion.tr
                                            key={material.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => router.get(`/teacher/materials/${material.id}`)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <TypeIcon type={material.content_type} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold truncate group-hover:text-primary transition-colors">
                                                            {material.title}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                            {material.description || 'Tidak ada deskripsi.'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <TypeBadge type={material.content_type} />
                                            </td>
                                            <td className="p-4 text-xs text-muted-foreground">
                                                {material.created_at
                                                    ? new Date(material.created_at).toLocaleDateString('id-ID', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/materials/${material.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4 text-primary" /> Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/teacher/materials/${material.id}/edit`}>
                                                                    <Pencil className="mr-2 h-4 w-4 text-primary" /> Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={() => setMaterialToDelete(material)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                                            {searchQuery || typeFilter !== 'all'
                                                ? 'Tidak ada materi yang sesuai dengan pencarian/filter.'
                                                : 'Belum ada materi khusus untuk kelas ini.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal Salin Materi dari Kelas Lain */}
            <Dialog open={isCopyModalOpen} onOpenChange={setIsCopyModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Copy className="h-5 w-5 text-primary" />
                            Salin Materi dari Kelas Lain
                        </DialogTitle>
                        <DialogDescription>
                            Pilih materi dari kelas lain untuk disalin ke kelas <strong>{classroom.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCopySubmit} className="space-y-4 pt-2">
                        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                            {otherClassroomMaterials.map((m) => {
                                const isSelected = selectedCopyIds.includes(m.id);

                                return (
                                    <div
                                        key={m.id}
                                        onClick={() => toggleCopySelect(m.id)}
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
                                                        {m.classroom_name}
                                                    </Badge>
                                                    <p className="text-xs font-bold text-foreground">
                                                        {m.title}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                                    {m.description || 'Tidak ada deskripsi.'}
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
                                Salin {selectedCopyIds.length > 0 ? `${selectedCopyIds.length} ` : ''}Materi Sekarang
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Delete Material */}
            <Dialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle>Hapus Materi Pembelajaran</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus materi <span className="font-bold text-foreground">{materialToDelete?.title}</span>? Tindakan ini permanen.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setMaterialToDelete(null)} disabled={isDeleting}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteMaterial} disabled={isDeleting} className="gap-2">
                            {isDeleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Trash2 className="h-4 w-4" />}
                            Hapus Materi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
