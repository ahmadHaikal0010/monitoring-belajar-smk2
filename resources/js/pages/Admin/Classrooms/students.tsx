import { Head, Link, setLayoutProps, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    UserPlus,
    UserMinus,
    Search,
    Users,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Classroom {
    id: string;
    major_id: string;
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

interface EnrolledStudent {
    enrollment_id: string;
    classroom_id: string;
    student_id: string;
    status: 'aktif' | 'pindah' | 'lulus';
    enrolled_at: string;
    nisn: string;
    photo?: string;
    student_name: string;
    student_email: string;
}

interface UnassignedStudent {
    student_id: string;
    nisn: string;
    photo?: string;
    student_name: string;
    student_email: string;
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
    classroom: Classroom;
    students: PaginatedData<EnrolledStudent>;
    unassignedStudents: PaginatedData<UnassignedStudent>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function ClassroomStudents({
    classroom,
    students,
    unassignedStudents,
    filters,
}: Props) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Manajemen Jurusan & Kelas',
                href: '/admin/majors',
            },
            {
                title: `Anggota Kelas ${classroom.name}`,
                href: `/admin/classrooms/${classroom.id}/students`,
            },
        ],
    });

    const [activeTab, setActiveTab] = useState<'members' | 'add'>('members');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [unassignedSearch, setUnassignedSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearchMembers = useCallback(
        (val: string) => {
            router.get(
                `/admin/classrooms/${classroom.id}/students`,
                { search: val },
                { preserveState: true, replace: true }
            );
        },
        [classroom.id]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                handleSearchMembers(search);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, filters.search, handleSearchMembers]);

    const handleSearchUnassigned = (val: string) => {
        setUnassignedSearch(val);
        router.get(
            `/admin/classrooms/${classroom.id}/students`,
            { unassigned_search: val },
            { preserveState: true, replace: true }
        );
    };

    const toggleSelectStudent = (id: string) => {
        if (selectedStudentIds.includes(id)) {
            setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
        } else {
            setSelectedStudentIds([...selectedStudentIds, id]);
        }
    };

    const toggleSelectAllUnassigned = () => {
        if (selectedStudentIds.length === unassignedStudents.data.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(unassignedStudents.data.map((s) => s.student_id));
        }
    };

    const handleAssignStudents = () => {
        if (selectedStudentIds.length === 0) {
return;
}

        setIsSubmitting(true);

        router.post(
            `/admin/classrooms/${classroom.id}/students`,
            { student_ids: selectedStudentIds },
            {
                onSuccess: () => {
                    setSelectedStudentIds([]);
                    setIsSubmitting(false);
                    setActiveTab('members');
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleRemoveStudent = (studentId: string) => {
        if (!confirm('Apakah Anda yakin ingin mengeluarkan siswa dari kelas ini?')) {
return;
}

        setIsSubmitting(true);

        router.delete(`/admin/classrooms/${classroom.id}/students/${studentId}`, {
            onSuccess: () => setIsSubmitting(false),
            onError: () => setIsSubmitting(false),
        });
    };

    const handleUpdateStatus = (studentId: string, status: string) => {
        router.put(
            `/admin/classrooms/${classroom.id}/students/${studentId}`,
            { status },
            { preserveState: true }
        );
    };

    return (
        <>
            <Head title={`Kelola Siswa - ${classroom.name}`} />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-mono font-bold px-2.5 py-1 border border-blue-200 dark:border-blue-800 text-xs">
                                {classroom.major_code}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">
                                T.A {classroom.academic_year}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Kelola Anggota Kelas {classroom.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Wali Kelas: <strong className="text-foreground">{classroom.homeroom_teacher_name || 'Belum ditentukan'}</strong>
                        </p>
                    </div>

                    <Button variant="outline" asChild className="gap-2">
                        <Link href="/admin/majors">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </Link>
                    </Button>
                </div>

                {/* Tab Header Buttons */}
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'members'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        Anggota Kelas ({students.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                            activeTab === 'add'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <UserPlus className="h-4 w-4" />
                        Tambah Siswa Baru
                    </button>
                </div>

                {/* TAB 1: Member List */}
                {activeTab === 'members' && (
                    <div className="space-y-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau NISN siswa..."
                                className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                NISN
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Nama Siswa
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Email
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Status Anggota
                                            </th>
                                            <th className="p-4 text-right text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                        {students.data.length > 0 ? (
                                            students.data.map((student) => (
                                                <motion.tr
                                                    key={student.enrollment_id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="transition-colors hover:bg-muted/50"
                                                >
                                                    <td className="p-4 font-mono font-bold text-foreground text-xs">
                                                        {student.nisn}
                                                    </td>
                                                    <td className="p-4 font-medium text-foreground">
                                                        {student.student_name}
                                                    </td>
                                                    <td className="p-4 text-muted-foreground text-xs">
                                                        {student.student_email}
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={student.status}
                                                            onChange={(e) =>
                                                                handleUpdateStatus(
                                                                    student.student_id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="h-8 rounded-lg border border-zinc-200 bg-background/50 px-2 text-xs font-medium focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                                        >
                                                            <option value="aktif">Aktif</option>
                                                            <option value="pindah">Pindah</option>
                                                            <option value="lulus">Lulus</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveStudent(student.student_id)
                                                            }
                                                            className="h-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 text-xs gap-1"
                                                        >
                                                            <UserMinus className="h-3.5 w-3.5" />
                                                            <span>Keluarkan</span>
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground italic">
                                                    Belum ada siswa di kelas ini. Klik tab "Tambah Siswa Baru" untuk memasukkan siswa.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {students.total > 0 && (
                                <div className="flex items-center justify-between border-t border-zinc-200 bg-muted/10 p-4 dark:border-zinc-800">
                                    <p className="text-xs text-muted-foreground">
                                        Menampilkan{' '}
                                        <span className="font-bold text-foreground">{students.from || 0}</span> sampai{' '}
                                        <span className="font-bold text-foreground">{students.to || 0}</span> dari{' '}
                                        <span className="font-bold text-foreground">{students.total}</span> siswa
                                    </p>
                                    <div className="flex items-center gap-1">
                                        {students.links.map((link, i) => {
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
                            )}
                        </Card>
                    </div>
                )}

                {/* TAB 2: Add Unassigned Students */}
                {activeTab === 'add' && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Cari siswa belum memiliki kelas..."
                                    className="h-10 border-zinc-200 bg-background/50 pl-9 backdrop-blur-sm dark:border-zinc-800 text-sm"
                                    value={unassignedSearch}
                                    onChange={(e) => handleSearchUnassigned(e.target.value)}
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
                                                        unassignedStudents.data.length > 0 &&
                                                        selectedStudentIds.length === unassignedStudents.data.length
                                                    }
                                                    onChange={toggleSelectAllUnassigned}
                                                    className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                />
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                NISN
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Nama Siswa
                                            </th>
                                            <th className="p-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Email
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                                        {unassignedStudents.data.length > 0 ? (
                                            unassignedStudents.data.map((student) => {
                                                const isSelected = selectedStudentIds.includes(
                                                    student.student_id
                                                );

                                                return (
                                                    <motion.tr
                                                        key={student.student_id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        onClick={() =>
                                                            toggleSelectStudent(student.student_id)
                                                        }
                                                        className={`cursor-pointer transition-colors ${
                                                            isSelected
                                                                ? 'bg-muted/70 font-medium'
                                                                : 'hover:bg-muted/50'
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
                                                        <td className="p-4 font-mono font-bold text-foreground text-xs">
                                                            {student.nisn}
                                                        </td>
                                                        <td className="p-4 font-medium text-foreground">
                                                            {student.student_name}
                                                        </td>
                                                        <td className="p-4 text-muted-foreground text-xs">
                                                            {student.student_email}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                                                    Tidak ada siswa yang tersedia (semua siswa telah memiliki kelas).
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
