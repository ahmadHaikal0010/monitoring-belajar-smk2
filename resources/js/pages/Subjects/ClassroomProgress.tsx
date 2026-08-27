import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    School,
    Check,
    X,
    UserCheck,
    Search,
    Download,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ExportReportModal } from '@/components/ExportReportModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

interface StudentItem {
    student_id: string;
    enrollment_id?: string;
    student_name: string;
    student_email: string;
    student_nisn: string;
    student_photo?: string;
    classroom_status: string;
    enrollment_status?: string;
    completed_materials?: number;
    total_materials?: number;
}

interface Props {
    subject: Subject;
    classroom: Classroom;
    students: StudentItem[];
}

export default function ClassroomProgress({
    subject,
    classroom,
    students,
}: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
                { title: subject.title, href: `/teacher/subjects/${subject.id}?tab=progress` },
                { title: `Progress Kelas ${classroom.name}`, href: '#' },
            ],
        });
    }, [subject.id, subject.title, classroom.name]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) {
return students;
}

        const q = searchQuery.toLowerCase();

        return students.filter(
            (s) =>
                (s.student_name && s.student_name.toLowerCase().includes(q)) ||
                (s.student_nisn && s.student_nisn.toLowerCase().includes(q)) ||
                (s.student_email && s.student_email.toLowerCase().includes(q))
        );
    }, [students, searchQuery]);

    return (
        <>
            <Head title={`Progress Siswa ${subject.title} - ${classroom.name}`} />

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
                        <Link href={`/teacher/subjects/${subject.id}?tab=progress`}>
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
                            Progress Siswa - {classroom.name}
                        </h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Pantau tingkat keaktifan dan penyelesaian materi siswa khusus kelas {classroom.name} (T.A {classroom.academic_year}).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsExportModalOpen(true)}
                            size="sm"
                            className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export Rekap Laporan Kelas</span>
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari siswa berdasarkan nama, NISN, atau email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>

                {/* Student Progress Table */}
                <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Siswa
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Status Kelas
                                    </th>
                                    <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">
                                        Progres Materi
                                    </th>
                                    <th className="p-4 text-right font-bold text-muted-foreground uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((item, index) => {
                                        const completed = item.completed_materials ?? 0;
                                        const total = item.total_materials ?? 0;
                                        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

                                        return (
                                            <motion.tr
                                                key={item.student_id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="group hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
                                                            {item.student_name?.charAt(0) || 'S'}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-semibold text-foreground truncate">
                                                                {item.student_name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground truncate">
                                                                NISN: {item.student_nisn || '-'} • {item.student_email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            item.classroom_status === 'aktif'
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200'
                                                                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200'
                                                        }
                                                    >
                                                        {item.classroom_status || 'aktif'}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex flex-col gap-1.5 max-w-[200px]">
                                                        <div className="flex items-center justify-between text-[11px] font-medium">
                                                            <span>{completed} / {total} Materi</span>
                                                            <span className="font-bold text-primary">{percentage}%</span>
                                                        </div>
                                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-500 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {item.enrollment_id ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1 text-xs"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/enrollments/${item.enrollment_id}/progress`}>
                                                                <UserCheck className="h-3.5 w-3.5 text-primary" />
                                                                <span>Detail Rapor</span>
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Belum terdaftar mapel</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground italic">
                                            {searchQuery ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa terdaftar di rombel kelas ini.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Export Modal with fixed classroomId */}
            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                subjectId={subject.id}
                subjectTitle={subject.title}
                classroomId={classroom.id}
            />
        </>
    );
}
