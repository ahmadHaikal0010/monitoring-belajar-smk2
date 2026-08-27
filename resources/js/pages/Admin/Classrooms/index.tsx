import { Head, Link, setLayoutProps, router } from '@inertiajs/react';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    UserCheck,
    Users,
    AlertTriangle,
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

interface Major {
    id: string;
    code: string;
    name: string;
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

interface Props {
    classrooms: {
        data: Classroom[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    majors: Major[];
    filters: {
        search?: string;
        major_id?: string;
        grade?: string;
        academic_year?: string;
        sort?: string;
        direction?: string;
    };
}

export default function ClassroomsIndex({ classrooms, majors, filters }: Props) {
    useEffect(() => {
        setLayoutProps({
            title: 'Manajemen Rombel / Kelas',
            header: (
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Manajemen Rombel / Kelas
                    </h1>
                </div>
            ),
        });
    }, []);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedMajor, setSelectedMajor] = useState(filters.major_id || '');
    const [selectedGrade, setSelectedGrade] = useState(filters.grade || '');
    const [deletingClassroom, setDeletingClassroom] = useState<Classroom | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFilter = useCallback(
        (newFilters: Record<string, string>) => {
            router.get(
                '/admin/classrooms',
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
        }, 300);

        return () => clearTimeout(timer);
    }, [search, filters.search, handleFilter]);

    const handleDelete = () => {
        if (!deletingClassroom) {
return;
}

        setIsDeleting(true);

        router.delete(`/admin/classrooms/${deletingClassroom.id}`, {
            onSuccess: () => {
                setDeletingClassroom(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <>
            <Head title="Manajemen Rombel / Kelas" />

            <div className="space-y-6">
                {/* Header Action Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Daftar Rombel & Kelas Siswa
                        </h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Kelola rombel kelas, tetapkan wali kelas, dan distribusikan siswa di setiap kelas.
                        </p>
                    </div>
                    <Link href="/admin/classrooms/create">
                        <Button className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Rombel Kelas Baru
                        </Button>
                    </Link>
                </div>

                {/* Filters Bar */}
                <Card className="p-4 rounded-2xl border-zinc-200/80 bg-white/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="relative col-span-1 sm:col-span-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <Input
                                placeholder="Cari nama kelas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-10 rounded-xl border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 text-sm"
                            />
                        </div>

                        <select
                            value={selectedMajor}
                            onChange={(e) => {
                                setSelectedMajor(e.target.value);
                                handleFilter({ major_id: e.target.value });
                            }}
                            className="h-10 rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
                        >
                            <option value="">Semua Jurusan</option>
                            {majors.map((m) => (
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
                            className="h-10 rounded-xl border border-zinc-200 bg-white/80 px-3 text-sm focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
                        >
                            <option value="">Semua Tingkat</option>
                            <option value="10">Kelas 10</option>
                            <option value="11">Kelas 11</option>
                            <option value="12">Kelas 12</option>
                        </select>
                    </div>
                </Card>

                {/* Grid View Classrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classrooms.data.length > 0 ? (
                        classrooms.data.map((c) => (
                            <Card
                                key={c.id}
                                className="p-5 rounded-2xl border-zinc-200/80 bg-white/50 backdrop-blur-xl hover:shadow-md transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 flex flex-col justify-between"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 rounded-lg px-2.5 py-1 border border-blue-200 dark:border-blue-800 font-semibold text-xs">
                                            {c.major_code}
                                        </Badge>
                                        <span className="text-xs font-medium text-zinc-400">
                                            T.A {c.academic_year}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                            {c.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 mt-0.5">
                                            Tingkat {c.grade} • Rombel {c.section}
                                        </p>
                                    </div>

                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-zinc-500">
                                                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                Wali Kelas:
                                            </span>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                                {c.homeroom_teacher_name || (
                                                    <span className="text-rose-500 italic">Belum ditentukan</span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-zinc-500">
                                                <Users className="h-3.5 w-3.5 text-indigo-500" />
                                                Jumlah Siswa:
                                            </span>
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                {c.students_count} Siswa
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2">
                                    <Link href={`/admin/classrooms/${c.id}/students`} className="flex-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full rounded-xl text-xs h-9 border-zinc-200 dark:border-zinc-700"
                                        >
                                            <Users className="mr-1.5 h-3.5 w-3.5" />
                                            Kelola Siswa
                                        </Button>
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        <Link href={`/admin/classrooms/${c.id}/edit`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-9 w-9 p-0 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            >
                                                <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingClassroom(c)}
                                            className="h-9 w-9 p-0 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center text-zinc-500">
                            Belum ada data rombel/kelas. Klik tombol di atas untuk menambah kelas baru.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {classrooms.links.length > 3 && (
                    <Card className="flex items-center justify-between px-6 py-4 rounded-2xl border-zinc-200/80 bg-white/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50">
                        <p className="text-xs text-zinc-500">
                            Menampilkan {classrooms.from || 0} - {classrooms.to || 0} dari {classrooms.total} kelas
                        </p>
                        <div className="flex items-center gap-1">
                            {classrooms.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    className="h-8 min-w-[32px] px-2 text-xs rounded-lg"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal Delete Confirmation */}
            <Dialog open={!!deletingClassroom} onOpenChange={() => setDeletingClassroom(null)}>
                <DialogContent className="rounded-2xl sm:max-w-md">
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
                            className="rounded-xl"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-xl"
                        >
                            Ya, Hapus Kelas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
