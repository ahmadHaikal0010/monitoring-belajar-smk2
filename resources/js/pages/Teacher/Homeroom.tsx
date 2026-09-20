import { Head, setLayoutProps, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    AlertCircle,
    Search as SearchIcon,
    Check,
    UserMinusIcon,
    UserPlus,
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

interface StudentItem {
    student_id: string;
    enrollment_id?: string;
    student_name: string;
    student_email: string;
    nisn?: string;
    photo?: string;
    classroom_status?: string;
    status?: string;
    submitted_assignments?: number;
    total_assignments?: number;
    completed_exams?: number;
    total_exams?: number;
    total_materials?: number;
    completed_materials?: number;
    materials_percentage?: number;
}

interface UnassignedStudent {
    student_id: string;
    nisn: string;
    student_name: string;
    student_email: string;
    photo?: string;
}

interface Classroom {
    id: string;
    name?: string;
}

interface PaginatedUnassignedStudents {
    data: UnassignedStudent[];
    total: number;
}

interface Props {
    classroom: Classroom | null;
    students: StudentItem[];
    unassignedStudents: PaginatedUnassignedStudents | UnassignedStudent[];
    filters?: {
        search?: string;
        unassigned_search?: string;
    };
}

export default function Homeroom({ classroom, students, unassignedStudents, filters = {} }: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);

    const getInitialTab = (): 'manage' | 'add' | 'progress' => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');

            if (tabParam && ['manage', 'add', 'progress'].includes(tabParam)) {
                return tabParam as any;
            }

            const saved = localStorage.getItem('active_homeroom_tab');

            if (saved && ['manage', 'add', 'progress'].includes(saved)) {
                return saved as any;
            }
        }

        return 'manage';
    };

    const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'progress'>(getInitialTab);
    const [search, setSearch] = useState(filters.search || '');
    const [unassignedSearch, setUnassignedSearch] = useState(filters.unassigned_search || '');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentToRemove, setStudentToRemove] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const unassignedList = Array.isArray(unassignedStudents)
        ? unassignedStudents
        : (unassignedStudents?.data ?? []);

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Wali Kelas', href: '/teacher/homeroom' },
                { title: classroom?.name || 'Wali Kelas', href: '/teacher/homeroom' },
            ],
        });
    }, [classroom?.id, classroom?.name]);

    useEffect(() => {
        if (flash?.success) {
            const timer = setTimeout(() => setDismissedFlash(flash.success), 5000);

            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleTabChange = (tab: 'manage' | 'add' | 'progress') => {
        setActiveTab(tab);

        if (typeof window !== 'undefined') {
            localStorage.setItem('active_homeroom_tab', tab);
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const handleSearchMembers = useCallback((val: string) => {
        router.get('/teacher/homeroom', { search: val }, { preserveState: true, replace: true });
    }, []);

    const handleSearchUnassigned = useCallback((val: string) => {
        router.get('/teacher/homeroom', { unassigned_search: val }, { preserveState: true, replace: true });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleSearchMembers(search);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, filters.search, handleSearchMembers]);

    const toggleSelectStudent = (id: string) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const toggleSelectAllUnassigned = () => {
        if (selectedStudentIds.length === unassignedList.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(unassignedList.map((student) => student.student_id));
        }
    };

    const handleAssignStudents = () => {
        if (selectedStudentIds.length === 0) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            '/teacher/homeroom/students',
            { student_ids: selectedStudentIds },
            {
                onSuccess: () => {
                    setSelectedStudentIds([]);
                    setIsSubmitting(false);
                    setActiveTab('manage');
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleUpdateStatus = (studentId: string, status: string) => {
        router.put(`/teacher/homeroom/students/${studentId}`, { status }, { preserveState: false });
    };

    const handleConfirmRemoveStudent = () => {
        if (!studentToRemove) {
            return;
        }

        setIsSubmitting(true);
        router.delete(`/teacher/homeroom/students/${studentToRemove.student_id}`, {
            onSuccess: () => {
                setIsSubmitting(false);
                setStudentToRemove(null);
            },
            onError: () => setIsSubmitting(false),
        });
    };

    if (!classroom) {
        return (
            <div className="p-6">
                <Head title="Wali Kelas" />
                <Card className="p-6 text-center">Anda belum ditugaskan sebagai wali kelas.</Card>
            </div>
        );
    }

    return (
        <>
            <Head title={`Wali Kelas - ${classroom.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <AnimatePresence>
                    {flash?.success && dismissedFlash !== flash.success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm border-emerald-200 bg-emerald-50">
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-emerald-800">{flash.success}</p>
                                </div>
                                <button onClick={() => setDismissedFlash(flash.success)} className="rounded-lg p-1">×</button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-50 text-blue-700 font-mono font-bold px-2.5 py-1 border border-blue-200 text-xs">
                                Rombel
                            </Badge>
                            <span className="text-xs text-muted-foreground">Kelola siswa dan progress kelas</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Wali Kelas - {classroom.name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 dark:border-zinc-800">
                    <button
                        onClick={() => handleTabChange('manage')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'manage'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Kelola Siswa</span>
                    </button>

                    <button
                        onClick={() => handleTabChange('add')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'add'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Tambah Anggota Kelas</span>
                    </button>

                    <button
                        onClick={() => handleTabChange('progress')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'progress'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <span>Progress</span>
                    </button>
                </div>

                {activeTab === 'manage' && (
                    <div className="space-y-4">
                        <div className="relative w-full sm:w-80">
                            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau NISN siswa..."
                                className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">NISN</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Nama Siswa</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Email</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Status</th>
                                            <th className="p-4 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                        {students.length > 0 ? (
                                            students.map((s: any) => (
                                                <motion.tr key={s.student_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="transition-colors hover:bg-muted/50">
                                                    <td className="p-4 font-mono font-bold text-foreground text-xs">{s.nisn || '-'}</td>
                                                    <td className="p-4 font-medium text-foreground">{s.student_name}</td>
                                                    <td className="p-4 text-muted-foreground text-xs">{s.student_email}</td>
                                                    <td className="p-4">
                                                        <select value={s.status ?? s.classroom_status} onChange={(e) => handleUpdateStatus(s.student_id, e.target.value)} className="h-8 rounded-lg border border-zinc-200 bg-background/50 px-2 text-xs font-medium focus:outline-none dark:border-zinc-800 dark:bg-zinc-900">
                                                            <option value="aktif">Aktif</option>
                                                            <option value="pindah">Pindah</option>
                                                            <option value="lulus">Lulus</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button variant="ghost" size="sm" onClick={() => setStudentToRemove(s)} className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs gap-1">
                                                            <UserMinusIcon className="h-3.5 w-3.5" />
                                                            <span>Keluarkan</span>
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground italic">Belum ada siswa terdaftar.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'add' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="relative w-full sm:w-80">
                                <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari siswa yang belum masuk kelas..."
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm text-sm"
                                    value={unassignedSearch}
                                    onChange={(e) => {
                                        const nextValue = e.target.value;
                                        setUnassignedSearch(nextValue);
                                        handleSearchUnassigned(nextValue);
                                    }}
                                />
                            </div>

                            <Button
                                onClick={handleAssignStudents}
                                disabled={selectedStudentIds.length === 0 || isSubmitting}
                                className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20"
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Masukkan ({selectedStudentIds.length}) Siswa Terpilih</span>
                            </Button>
                        </div>

                        <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                            <th className="p-4 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        unassignedList.length > 0 &&
                                                        selectedStudentIds.length === unassignedList.length
                                                    }
                                                    onChange={toggleSelectAllUnassigned}
                                                    className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                />
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">NISN</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Nama Siswa</th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                        {unassignedList.length > 0 ? (
                                            unassignedList.map((student) => {
                                                const isSelected = selectedStudentIds.includes(student.student_id);

                                                return (
                                                    <motion.tr
                                                        key={student.student_id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        onClick={() => toggleSelectStudent(student.student_id)}
                                                        className={`cursor-pointer transition-colors ${
                                                            isSelected ? 'bg-muted/70 font-medium' : 'hover:bg-muted/50'
                                                        }`}
                                                    >
                                                        <td className="p-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => {}}
                                                                className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="p-4 font-mono font-bold text-foreground text-xs">{student.nisn}</td>
                                                        <td className="p-4 font-medium text-foreground">{student.student_name}</td>
                                                        <td className="p-4 text-muted-foreground text-xs">{student.student_email}</td>
                                                    </motion.tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                                    Tidak ada siswa yang tersedia untuk ditambahkan ke kelas ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Siswa</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Progress Materi</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Progress Tugas</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Progress Ujian</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                    {students.length > 0 ? (
                                        students.map((s: any) => (
                                            <tr key={s.student_id} className="hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">{s.student_name?.charAt(0) || 'S'}</div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-semibold text-foreground truncate">{s.student_name}</span>
                                                            <span className="text-xs text-muted-foreground truncate">NISN: {s.nisn || '-'} • {s.student_email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex flex-col gap-1.5 max-w-[200px]">
                                                        <div className="flex items-center justify-between text-[11px] font-medium">
                                                            <span>{s.completed_materials || 0} / {s.total_materials || 0} Materi</span>
                                                            <span className="font-bold text-primary">{s.materials_percentage || 0}%</span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${s.materials_percentage || 0}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex flex-col gap-1.5 max-w-[200px]">
                                                        <div className="flex items-center justify-between text-[11px] font-medium">
                                                            <span>{s.submitted_assignments || 0} / {s.total_assignments || 0} Tugas</span>
                                                            <span className="font-bold text-primary">{s.total_assignments ? Math.round(((s.submitted_assignments || 0) / s.total_assignments) * 100) : 0}%</span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${s.total_assignments ? Math.round(((s.submitted_assignments || 0) / s.total_assignments) * 100) : 0}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex flex-col gap-1.5 max-w-[200px]">
                                                        <div className="flex items-center justify-between text-[11px] font-medium">
                                                            <span>{s.completed_exams || 0} / {s.total_exams || 0} Ujian</span>
                                                            <span className="font-bold text-primary">{s.total_exams ? Math.round(((s.completed_exams || 0) / s.total_exams) * 100) : 0}%</span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${s.total_exams ? Math.round(((s.completed_exams || 0) / s.total_exams) * 100) : 0}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-12 text-center text-muted-foreground italic">Belum ada siswa terdaftar di rombel ini.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            <Dialog open={!!studentToRemove} onOpenChange={(open) => !open && setStudentToRemove(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="text-center sm:text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-xl font-bold">Keluarkan Siswa dari Kelas</DialogTitle>
                        <DialogDescription className="text-sm pt-2">Apakah Anda yakin ingin mengeluarkan <strong className="text-foreground font-semibold">{studentToRemove?.student_name}</strong> dari kelas <strong className="text-foreground font-semibold">{classroom.name}</strong>? Status keanggotaan siswa akan dilepas dari rombel ini.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={() => setStudentToRemove(null)} disabled={isSubmitting}>Batal</Button>
                        <Button variant="destructive" onClick={handleConfirmRemoveStudent} disabled={isSubmitting} className="gap-2">Keluarkan Siswa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
