import { Head, Link, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Building2,
    School,
    Users,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Check,
    X,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Major {
    id: string;
    code: string;
    name: string;
    created_at?: string;
}

interface Classroom {
    id: string;
    major_id: string;
    homeroom_teacher_id?: string;
    grade: string;
    section: string;
    name: string;
    academic_year: string;
    major_code: string;
    major_name: string;
    homeroom_teacher_name?: string;
    homeroom_teacher_nip?: string;
    students_count: number;
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

interface Props {
    majors: PaginatedData<Major>;
    allMajors: Major[];
    classrooms: PaginatedData<Classroom>;
    filters: {
        search?: string;
        major_id?: string;
        grade?: string;
        academic_year?: string;
    };
}

export default function MajorsIndex({ majors, allMajors, classrooms, filters }: Props) {
    const { flash } = usePage().props as any;
    const [showSuccess, setShowSuccess] = useState(false);

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
                title: 'Manajemen Jurusan & Kelas',
                href: '/admin/majors',
            },
        ],
    });

    const [activeTab, setActiveTab] = useState<'majors' | 'classrooms'>(
        filters.major_id || filters.grade ? 'classrooms' : 'majors'
    );

    const [search, setSearch] = useState(filters.search || '');
    const [selectedMajor, setSelectedMajor] = useState(filters.major_id || '');
    const [selectedGrade, setSelectedGrade] = useState(filters.grade || '');

    // Major Modal state
    const [isCreateMajorOpen, setIsCreateMajorOpen] = useState(false);
    const [editingMajor, setEditingMajor] = useState<Major | null>(null);
    const [deletingMajor, setDeletingMajor] = useState<Major | null>(null);
    const [formCode, setFormCode] = useState('');
    const [formName, setFormName] = useState('');

    // Classroom Delete Modal state
    const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFilter = useCallback(
        (newFilters: Record<string, string>) => {
            router.get(
                '/admin/majors',
                {
                    search,
                    major_id: selectedMajor,
                    grade: selectedGrade,
                    ...newFilters,
                },
                { preserveState: true, replace: true }
            );
        },
        [search, selectedMajor, selectedGrade]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleFilter({ search });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, filters.search, handleFilter]);

    const openCreateMajorModal = () => {
        setEditingMajor(null);
        setFormCode('');
        setFormName('');
        setErrors({});
        setIsCreateMajorOpen(true);
    };

    const openEditMajorModal = (major: Major) => {
        setEditingMajor(major);
        setFormCode(major.code);
        setFormName(major.name);
        setErrors({});
        setIsCreateMajorOpen(true);
    };

    const handleMajorSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            kode_jurusan: formCode,
            nama_jurusan: formName,
        };

        if (editingMajor) {
            router.put(`/admin/majors/${editingMajor.id}`, payload, {
                onSuccess: () => {
                    setIsCreateMajorOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/admin/majors', payload, {
                onSuccess: () => {
                    setIsCreateMajorOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    setErrors(errs);
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleMajorDelete = () => {
        if (!deletingMajor) {
return;
}

        setIsSubmitting(true);

        router.delete(`/admin/majors/${deletingMajor.id}`, {
            onSuccess: () => {
                setDeletingMajor(null);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const handleClassroomDelete = () => {
        if (!deletingClassroom) {
return;
}

        setIsSubmitting(true);

        router.delete(`/admin/classrooms/${deletingClassroom.id}`, {
            onSuccess: () => {
                setDeletingClassroom(null);
                setIsSubmitting(false);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    const filterByMajorId = (majorId: string) => {
        setSelectedMajor(majorId);
        setActiveTab('classrooms');
        handleFilter({ major_id: majorId });
    };

    return (
        <>
            <Head title="Manajemen Jurusan & Kelas" />

            <div className="flex flex-col gap-6 p-6">
                {/* Success Flash Banner */}
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

                {/* Header Action Bar */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Manajemen Jurusan & Kelas
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola data program keahlian/jurusan, rombel kelas, wali kelas, dan anggota kelas.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={openCreateMajorModal}
                            className="h-10 gap-2 border-zinc-200 bg-background/50 dark:border-zinc-800"
                        >
                            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Tambah Jurusan</span>
                        </Button>

                        <Button
                            className="h-10 gap-2 shadow-lg shadow-primary/20"
                            asChild
                        >
                            <Link href="/admin/classrooms/create">
                                <Plus className="h-4 w-4" />
                                <span>Tambah Rombel Kelas</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Segmented Tab Navigation Bar */}
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('majors')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'majors'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Building2 className="h-4 w-4" />
                        Program Keahlian / Jurusan ({majors.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('classrooms')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'classrooms'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <School className="h-4 w-4" />
                        Daftar Rombel / Kelas ({classrooms.total})
                    </button>
                </div>

                {/* TAB 1: Daftar Jurusan */}
                {activeTab === 'majors' && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode atau nama jurusan..."
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800 text-sm"
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
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Kode Jurusan
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Nama Program Keahlian / Jurusan
                                            </th>
                                            <th className="p-4 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                        {majors.data.length > 0 ? (
                                            majors.data.map((major) => (
                                                <motion.tr
                                                    key={major.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="p-4">
                                                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-mono font-bold px-2.5 py-1 border border-emerald-200 dark:border-emerald-800">
                                                            {major.code}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 font-medium text-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <span>{major.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => filterByMajorId(major.id)}
                                                                className="h-8 gap-1.5 text-xs border-zinc-200 dark:border-zinc-700"
                                                            >
                                                                <School className="h-3.5 w-3.5 text-primary" />
                                                                <span>Kelola Rombel Kelas</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => openEditMajorModal(major)}
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setDeletingMajor(major)}
                                                                className="h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-muted-foreground italic">
                                                    Belum ada data jurusan yang terdaftar.
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
                                    <span className="font-bold text-foreground">{majors.from || 0}</span> sampai{' '}
                                    <span className="font-bold text-foreground">{majors.to || 0}</span> dari{' '}
                                    <span className="font-bold text-foreground">{majors.total}</span> jurusan
                                </p>
                                <div className="flex items-center gap-1">
                                    {majors.links.map((link, i) => {
                                        const label = link.label.toLowerCase();
                                        const isPrev = label.includes('previous') || label.includes('prev') || label.includes('&laquo;');
                                        const isNext = label.includes('next') || label.includes('&raquo;');
                                        const isEllipsis = link.label === '...';

                                        if (isEllipsis) {
                                            return <div key={i} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">...</div>;
                                        }

                                        return (
                                            <Button
                                                key={i}
                                                variant={link.active ? 'default' : 'outline'}
                                                size={isPrev || isNext ? 'icon' : 'sm'}
                                                className={`h-8 min-w-[2rem] ${link.active ? 'pointer-events-none font-bold' : 'text-xs'}`}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            >
                                                {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* TAB 2: Daftar Rombel Kelas */}
                {activeTab === 'classrooms' && (
                    <div className="space-y-4">
                        {/* Filters Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama kelas..."
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800 text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <select
                                value={selectedMajor}
                                onChange={(e) => {
                                    setSelectedMajor(e.target.value);
                                    handleFilter({ major_id: e.target.value });
                                }}
                                className="h-10 rounded-lg border border-zinc-200 bg-background/50 px-3 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <option value="">Semua Jurusan</option>
                                {allMajors.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.code} - {m.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedGrade}
                                onChange={(e) => {
                                    setSelectedGrade(e.target.value);
                                    handleFilter({ grade: e.target.value });
                                }}
                                className="h-10 rounded-lg border border-zinc-200 bg-background/50 px-3 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <option value="">Semua Tingkat</option>
                                <option value="10">Kelas 10</option>
                                <option value="11">Kelas 11</option>
                                <option value="12">Kelas 12</option>
                            </select>
                        </div>

                        {/* Grid View Classrooms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {classrooms.data.length > 0 ? (
                                classrooms.data.map((c) => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <Card className="p-5 overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm flex flex-col justify-between h-full">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-mono font-bold px-2.5 py-1 border border-blue-200 dark:border-blue-800 text-xs">
                                                        {c.major_code}
                                                    </Badge>
                                                    <span className="text-xs font-medium text-muted-foreground">
                                                        T.A {c.academic_year}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                                                        {c.name}
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Tingkat {c.grade} • Rombel {c.section}
                                                    </p>
                                                </div>

                                                <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                            Wali Kelas:
                                                        </span>
                                                        <span className="font-medium text-foreground">
                                                            {c.homeroom_teacher_name || (
                                                                <span className="text-rose-500 italic">Belum ditentukan</span>
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Users className="h-3.5 w-3.5 text-primary" />
                                                            Jumlah Siswa:
                                                        </span>
                                                        <span className="font-semibold text-foreground">
                                                            {c.students_count} Siswa
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                                                <Link href={`/admin/classrooms/${c.id}/students`} className="flex-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full gap-1.5 text-xs h-9"
                                                    >
                                                        <Users className="h-3.5 w-3.5 text-primary" />
                                                        <span>Kelola Siswa</span>
                                                    </Button>
                                                </Link>

                                                <div className="flex items-center gap-1">
                                                    <Link href={`/admin/classrooms/${c.id}/edit`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeletingClassroom(c)}
                                                        className="h-9 w-9 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center text-muted-foreground italic">
                                    Belum ada data rombel/kelas. Klik tombol "Tambah Rombel Kelas" di atas untuk menambah kelas.
                                </div>
                            )}
                        </div>

                        {/* Pagination for Classrooms */}
                        {classrooms.total > 0 && (
                            <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                                <div className="flex items-center justify-between p-4">
                                    <p className="text-xs text-muted-foreground">
                                        Menampilkan{' '}
                                        <span className="font-bold text-foreground">{classrooms.from || 0}</span> sampai{' '}
                                        <span className="font-bold text-foreground">{classrooms.to || 0}</span> dari{' '}
                                        <span className="font-bold text-foreground">{classrooms.total}</span> rombel kelas
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {classrooms.links.map((link, i) => {
                                            const label = link.label.toLowerCase();
                                            const isPrev = label.includes('previous') || label.includes('prev') || label.includes('&laquo;');
                                            const isNext = label.includes('next') || label.includes('&raquo;');
                                            const isEllipsis = link.label === '...';

                                            if (isEllipsis) {
                                                return <div key={i} className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground">...</div>;
                                            }

                                            return (
                                                <Button
                                                    key={i}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size={isPrev || isNext ? 'icon' : 'sm'}
                                                    className={`h-8 min-w-[2rem] ${link.active ? 'pointer-events-none font-bold' : 'text-xs'}`}
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                >
                                                    {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : link.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Create/Edit Major */}
            <Dialog open={isCreateMajorOpen} onOpenChange={setIsCreateMajorOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMajor ? 'Edit Jurusan' : 'Tambah Jurusan Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            Isi kode dan nama lengkap program studi/jurusan di bawah ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleMajorSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="kode_jurusan">Kode Jurusan</Label>
                            <Input
                                id="kode_jurusan"
                                placeholder="Contoh: TKJ, RPL, TKL"
                                value={formCode}
                                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                                className="h-10 border-zinc-200 bg-background/50 backdrop-blur-sm dark:border-zinc-800"
                                required
                            />
                            {errors.kode_jurusan && (
                                <p className="text-xs text-rose-500">{errors.kode_jurusan}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="nama_jurusan">Nama Jurusan / Program Keahlian</Label>
                            <Input
                                id="nama_jurusan"
                                placeholder="Contoh: Teknik Komputer dan Jaringan"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                className="h-10 border-zinc-200 bg-background/50 backdrop-blur-sm dark:border-zinc-800"
                                required
                            />
                            {errors.nama_jurusan && (
                                <p className="text-xs text-rose-500">{errors.nama_jurusan}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateMajorOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="shadow-lg shadow-primary/20"
                            >
                                {editingMajor ? 'Simpan Perubahan' : 'Tambah Jurusan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Delete Major Confirmation */}
            <Dialog open={!!deletingMajor} onOpenChange={() => setDeletingMajor(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="h-5 w-5" />
                            Konfirmasi Hapus Jurusan
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus jurusan{' '}
                            <strong>{deletingMajor?.code} - {deletingMajor?.name}</strong>? Seluruh rombel yang terikat dengan jurusan ini juga akan terpengaruh.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingMajor(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleMajorDelete}
                            disabled={isSubmitting}
                        >
                            Ya, Hapus Jurusan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Delete Classroom Confirmation */}
            <Dialog open={!!deletingClassroom} onOpenChange={() => setDeletingClassroom(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="h-5 w-5" />
                            Konfirmasi Hapus Kelas
                        </DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kelas <strong>{deletingClassroom?.name}</strong>? Data keanggotaan siswa di kelas ini juga akan terhapus.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeletingClassroom(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleClassroomDelete}
                            disabled={isSubmitting}
                        >
                            Ya, Hapus Kelas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
