import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    FileText,
    Video,
    Link as LinkIcon,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Plus,
    X,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    User,
    ArrowLeft,
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
    description: string;
    teacher_name: string;
    teacher_email: string;
    created_at: string;
}

interface Material {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    content_body: string;
    description: string;
    subject_title: string;
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
    subject_id?: string;
}

interface Props {
    materials?: PaginatedData<Material>;
    subjects?: PaginatedData<Subject>;
    selectedSubject?: Subject;
    filters: Filters;
    mode: 'subjects' | 'materials';
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
        <Badge variant="outline" className={cn("border-none font-semibold", colors[type])}>
            {labels[type]}
        </Badge>
    );
};

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

export default function MaterialIndex({ materials, subjects, selectedSubject, filters, mode }: Props) {
    const { auth, flash } = usePage().props as any;
    const [search, setSearch] = useState(filters.search || '');
    const [showFlash, setShowFlash] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
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
                title: 'Materi Pembelajaran',
                href: '/teacher/materials',
            },
            ...(mode === 'materials' && selectedSubject ? [{
                title: selectedSubject.title,
                href: `/teacher/materials?subject_id=${selectedSubject.id}`,
            }] : []),
        ],
    });

    const handleSearch = useCallback(
        (value: string) => {
            router.get(
                '/teacher/materials',
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
            '/teacher/materials',
            { ...filters, sort: field, direction },
            { preserveState: true },
        );
    };

    const handleSubjectSelect = (subjectId: string) => {
        router.get('/teacher/materials', { ...filters, subject_id: subjectId, page: 1, search: '' });
    };

    const renderPagination = (data: PaginatedData<any>) => {
        if (data.total <= data.data.length) {
return null;
}

        return (
            <div className="flex items-center justify-between border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800 rounded-b-xl">
                <p className="text-xs text-muted-foreground">
                    Menampilkan <span className="font-bold text-foreground">{data.from || 0}</span> sampai <span className="font-bold text-foreground">{data.to || 0}</span> dari <span className="font-bold text-foreground">{data.total}</span> data
                </p>
                <div className="flex items-center gap-1">
                    {data.links.map((link, i) => {
                        const label = link.label.toLowerCase();
                        const isPrev = label.includes('previous') || label.includes('&laquo;');
                        const isNext = label.includes('next') || label.includes('&raquo;');
                        const isEllipsis = link.label === '...';

                        if (isEllipsis) {
return <div key={i} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">...</div>;
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
            <Head title={mode === 'subjects' ? "Pilih Mata Pelajaran" : `Materi: ${selectedSubject?.title}`} />

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
                                flash.success 
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                            )}>
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
                        <div className="flex items-center gap-3">
                            {mode === 'materials' && (
                                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => router.get('/teacher/materials')}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            )}
                            <h1 className="text-3xl font-bold tracking-tight">
                                {mode === 'subjects' ? "Materi Pembelajaran" : selectedSubject?.title}
                            </h1>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            {mode === 'subjects' 
                                ? "Pilih mata pelajaran untuk melihat materi yang tersedia." 
                                : `Daftar materi pembelajaran untuk mata pelajaran ${selectedSubject?.title}.`}
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <div className="flex w-full items-center gap-3 sm:w-auto">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder={mode === 'subjects' ? "Cari mata pelajaran..." : "Cari materi..."}
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
                                    <DropdownMenuContent align="end" className="w-48">
                                    <div className="p-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Urutkan Berdasarkan
                                    </div>
                                    {mode === 'subjects' ? (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSort('subjects.title')
                                                }
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span>Judul Mapel</span>
                                                    {filters.sort ===
                                                        'subjects.title' &&
                                                        (filters.direction ===
                                                        'asc' ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ))}
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleSort('users.name')
                                                }
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span>Nama Pengajar</span>
                                                    {filters.sort ===
                                                        'users.name' &&
                                                        (filters.direction ===
                                                        'asc' ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ))}
                                                </div>
                                            </DropdownMenuItem>
                                        </>
                                    ) : (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => handleSort('title')}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span>Judul Materi</span>
                                                    {filters.sort === 'title' &&
                                                        (filters.direction ===
                                                        'asc' ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ))}
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleSort('type')}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span>Jenis Konten</span>
                                                    {filters.sort === 'type' &&
                                                        (filters.direction ===
                                                        'asc' ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ))}
                                                </div>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleSort('date')}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <span>Tanggal Dibuat</span>
                                                    {filters.sort === 'date' &&
                                                        (filters.direction ===
                                                        'asc' ? (
                                                            <ArrowUp className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDown className="h-3 w-3" />
                                                        ))}
                                                </div>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <div className="my-1 border-t" />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setSearch('');
                                            router.get(
                                                '/teacher/materials',
                                                filters.subject_id
                                                    ? {
                                                          subject_id:
                                                              filters.subject_id,
                                                      }
                                                    : {},
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
                        {auth.user.role === 'guru' && mode === 'materials' && (
                            <Button className="h-10 w-full gap-2 shadow-lg shadow-primary/20 sm:w-auto" asChild>
                                <Link href={`/teacher/materials/create?subject_id=${selectedSubject?.id}`}>
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Materi</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {mode === 'subjects' ? (
                    /* SUBJECT PICKER MODE */
                    <div className="space-y-6">
                        {subjects && subjects.data.length > 0 ? (
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
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <div className="pt-2">
                                                    <h3 className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                                                        {subject.title}
                                                    </h3>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1 pb-4">
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {subject.description || 'Tidak ada deskripsi.'}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 bg-muted/20 text-xs text-muted-foreground flex justify-between">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3" />
                                                    <span className="truncate max-w-[100px]">{subject.teacher_name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    <span>Pilih Materi</span>
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
                    /* MATERIALS LIST MODE */
                    <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                        <th 
                                            className="p-4 font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => handleSort('title')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Materi
                                                <SortIcon field="title" currentSort={filters.sort} direction={filters.direction} />
                                            </div>
                                        </th>
                                        <th 
                                            className="p-4 font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => handleSort('type')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Jenis
                                                <SortIcon field="type" currentSort={filters.sort} direction={filters.direction} />
                                            </div>
                                        </th>
                                        <th 
                                            className="p-4 font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => handleSort('date')}
                                        >
                                            <div className="flex items-center gap-2">
                                                Dibuat
                                                <SortIcon field="date" currentSort={filters.sort} direction={filters.direction} />
                                            </div>
                                        </th>
                                        <th className="p-4 text-right font-bold text-muted-foreground uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {materials && materials.data.length > 0 ? (
                                        materials.data.map((material, index) => (
                                            <motion.tr
                                                key={material.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => router.get(`/teacher/materials/${material.id}`)}
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <TypeIcon type={material.content_type} />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-semibold truncate group-hover:text-primary transition-colors">{material.title}</span>
                                                            <span className="text-xs text-muted-foreground truncate max-w-[300px]">{material.description}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4"><TypeBadge type={material.content_type} /></td>
                                                <td className="p-4 text-xs text-muted-foreground">
                                                    {new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/teacher/materials/${material.id}`}><Eye className="mr-2 h-4 w-4 text-primary" /> Lihat Detail</Link>
                                                                </DropdownMenuItem>
                                                                {auth.user.role === 'guru' && (
                                                                    <>
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/teacher/materials/${material.id}/edit`}><Pencil className="mr-2 h-4 w-4 text-primary" /> Edit</Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem 
                                                                            className="text-destructive focus:text-destructive"
                                                                            onSelect={() => setMaterialToDelete(material)}
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                                        </DropdownMenuItem>                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-muted-foreground italic">Belum ada materi untuk mata pelajaran ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {materials && renderPagination(materials)}
                        </Card>
                        )}

                        {/* Delete Confirmation Dialog */}
                        <Dialog
                        open={!!materialToDelete}
                        onOpenChange={(open) => !open && setMaterialToDelete(null)}
                        >
                        <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                <AlertCircle className="h-6 w-6 text-destructive" />
                            </div>
                            <DialogTitle>Hapus Materi Pembelajaran</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus materi{' '}
                                <span className="font-bold text-foreground break-all">
                                    {materialToDelete?.title}
                                </span>
                                ? Tindakan ini permanen dan tidak dapat
                                dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button
                                variant="ghost"
                                onClick={() => setMaterialToDelete(null)}
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
                                Hapus Materi
                            </Button>
                        </DialogFooter>
                        </DialogContent>
                        </Dialog>
                        </div>
                        </>
                        );
}
