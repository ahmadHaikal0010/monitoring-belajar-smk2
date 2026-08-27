import { Head, Link, setLayoutProps, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Pencil,
    CheckSquare,
    Award,
    School,
    Plus,
    Check,
    X,
    Building2,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    TrendingUp,
    Download,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ExportReportModal } from '@/components/ExportReportModal';
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

interface Subject {
    id: string;
    title: string;
    code: string;
    description?: string;
    teacher_name: string;
    teacher_user_id: string;
    materials_count: number;
    created_at: string;
}

interface Classroom {
    id: string;
    name: string;
    grade: string;
    section: string;
    major_name?: string;
    students_count?: number;
}

interface AvailableClassroom {
    id: string;
    name: string;
    grade: string;
    section: string;
    academic_year: string;
    major_code: string;
    major_name: string;
}

interface Material {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    content_body?: string;
    description?: string;
    created_at: string;
    classrooms?: Classroom[];
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
    classrooms?: Classroom[];
}

interface Exam {
    id: string;
    title: string;
    description?: string;
    duration: number;
    pass_score: number;
    status: 'draft' | 'published' | 'archived';
    questions_count?: number;
    created_at: string;
    classrooms?: Classroom[];
}

interface Props {
    subject: Subject;
    classrooms: Classroom[];
    availableClassrooms: AvailableClassroom[];
    materials: Material[];
    assignments: Assignment[];
    exams: Exam[];
    auth: {
        user: {
            id: string;
            role: string;
        };
    };
}

export default function SubjectShow({
    subject,
    classrooms,
    availableClassrooms = [],
    materials,
    assignments,
    exams,
    auth,
}: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);

    // Initial tab read from query string or localStorage
    const getInitialTab = (): 'materials' | 'assignments' | 'exams' | 'progress' => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');

            if (tabParam && ['materials', 'assignments', 'exams', 'progress'].includes(tabParam)) {
                return tabParam as any;
            }

            const savedTab = localStorage.getItem(`active_subject_tab_${subject.id}`);

            if (savedTab && ['materials', 'assignments', 'exams', 'progress'].includes(savedTab)) {
                return savedTab as any;
            }
        }

        return 'materials';
    };

    const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'exams' | 'progress'>(getInitialTab);

    // Modal states
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isManageClassesOpen, setIsManageClassesOpen] = useState(false);
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
        classrooms.map((c) => c.id)
    );
    const [isSubmittingClasses, setIsSubmittingClasses] = useState(false);
    const [expandedMajorCode, setExpandedMajorCode] = useState<string | null>(null);

    const handleOpenManageClasses = () => {
        setSelectedClassIds(classrooms.map((c) => c.id));
        setIsManageClassesOpen(true);
    };

    const handleTabChange = (tab: 'materials' | 'assignments' | 'exams' | 'progress') => {
        setActiveTab(tab);

        if (typeof window !== 'undefined') {
            localStorage.setItem(`active_subject_tab_${subject.id}`, tab);
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const flashMessage = flash?.success;
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
                {
                    title: 'Mata Pelajaran',
                    href: '/teacher/subjects',
                },
                {
                    title: subject.title,
                    href: `/teacher/subjects/${subject.id}`,
                },
            ],
        });
    }, [subject.id, subject.title]);

    const isTeacher = auth.user.role === 'guru' && auth.user.id === subject.teacher_user_id;
    const isAdmin = auth.user.role === 'admin';
    const canManage = isTeacher || isAdmin;

    // Total student count across classrooms
    const totalStudentsCount = useMemo(() => {
        return classrooms.reduce((sum, c) => sum + (c.students_count || 0), 0);
    }, [classrooms]);

    // Group available classrooms by major
    const classroomsByMajor = useMemo(() => {
        const grouped: Record<string, { major_code: string; major_name: string; items: AvailableClassroom[] }> = {};
        availableClassrooms.forEach((c) => {
            if (!grouped[c.major_code]) {
                grouped[c.major_code] = {
                    major_code: c.major_code,
                    major_name: c.major_name,
                    items: [],
                };
            }

            grouped[c.major_code].items.push(c);
        });

        return Object.values(grouped);
    }, [availableClassrooms]);

    const toggleClassroomSelect = (id: string) => {
        if (selectedClassIds.includes(id)) {
            setSelectedClassIds(selectedClassIds.filter((item) => item !== id));
        } else {
            setSelectedClassIds([...selectedClassIds, id]);
        }
    };

    const handleSaveClassrooms = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingClasses(true);

        router.post(
            `/teacher/subjects/${subject.id}/classrooms`,
            { classroom_ids: selectedClassIds },
            {
                onSuccess: () => {
                    setIsManageClassesOpen(false);
                    setIsSubmittingClasses(false);
                },
                onError: () => {
                    setIsSubmittingClasses(false);
                },
            }
        );
    };

    // Helper counts per classroom
    const getMaterialCount = (classId: string) =>
        materials.filter((m) => m.classroom_id === classId || !m.classroom_id).length;

    const getAssignmentCount = (classId: string) =>
        assignments.filter((a) => a.classroom_id === classId || !a.classroom_id).length;

    const getExamCount = (classId: string) =>
        exams.filter((e) => e.classroom_id === classId || !e.classroom_id).length;

    return (
        <>
            <Head title={`Detail Mapel: ${subject.title}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Flash Banner */}
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

                {/* Back Button Positioned on LEFT */}
                <div>
                    <Button variant="outline" size="sm" asChild className="h-9 gap-1.5 text-xs">
                        <Link href="/teacher/subjects">
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Daftar Mapel</span>
                        </Link>
                    </Button>
                </div>

                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-mono font-bold px-2.5 py-1 border border-emerald-200 dark:border-emerald-800">
                                Kode: {subject.code}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                Pengampu: {subject.teacher_name}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {subject.title}
                        </h1>
                        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                            {subject.description || 'Tidak ada deskripsi yang tersedia untuk mata pelajaran ini.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {canManage && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleOpenManageClasses}
                                    className="h-10 gap-2 border-zinc-200 bg-background/50 dark:border-zinc-800 text-xs"
                                >
                                    <School className="h-4 w-4 text-primary" />
                                    <span>Kelola Kelas Diajar ({classrooms.length})</span>
                                </Button>

                                <Button variant="outline" className="h-10 gap-2 text-xs" asChild>
                                    <Link href={`/teacher/subjects/${subject.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        <span>Edit Mapel</span>
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Main 4-Tab Navigation Bar with Active Memory */}
                <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-1 dark:border-zinc-800">
                    <button
                        onClick={() => handleTabChange('materials')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'materials'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <BookOpen className="h-4.5 w-4.5" />
                        <span>Materi Pembelajaran</span>
                        <Badge variant="secondary" className="ml-1 text-[11px] font-mono px-2 py-0.5">
                            {materials.length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => handleTabChange('assignments')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'assignments'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <CheckSquare className="h-4.5 w-4.5" />
                        <span>Tugas Siswa</span>
                        <Badge variant="secondary" className="ml-1 text-[11px] font-mono px-2 py-0.5">
                            {assignments.length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => handleTabChange('exams')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'exams'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Award className="h-4.5 w-4.5" />
                        <span>Ujian & Evaluasi</span>
                        <Badge variant="secondary" className="ml-1 text-[11px] font-mono px-2 py-0.5">
                            {exams.length}
                        </Badge>
                    </button>

                    <button
                        onClick={() => handleTabChange('progress')}
                        className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                            activeTab === 'progress'
                                ? 'border-primary text-primary font-bold'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <TrendingUp className="h-4.5 w-4.5" />
                        <span>Progress Siswa</span>
                        <Badge variant="secondary" className="ml-1 text-[11px] font-mono px-2 py-0.5">
                            {totalStudentsCount} Siswa
                        </Badge>
                    </button>
                </div>

                {/* Classroom Cards Grid View across ALL 4 TABS */}
                {classrooms.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-muted-foreground">
                                Pilih kelas untuk melihat{' '}
                                <strong className="text-foreground font-bold">
                                    {activeTab === 'materials'
                                        ? 'materi'
                                        : activeTab === 'assignments'
                                          ? 'tugas'
                                          : activeTab === 'exams'
                                            ? 'ujian'
                                            : 'progress siswa'}
                                </strong>{' '}
                                khusus rombel tersebut:
                            </p>

                            {activeTab === 'progress' && (
                                <Button
                                    onClick={() => setIsExportModalOpen(true)}
                                    size="sm"
                                    className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export Rekap Laporan</span>
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {classrooms.map((cls) => {
                                const materialCount = getMaterialCount(cls.id);
                                const assignmentCount = getAssignmentCount(cls.id);
                                const examCount = getExamCount(cls.id);

                                const badgeLabel =
                                    activeTab === 'materials'
                                        ? `${materialCount} Materi`
                                        : activeTab === 'assignments'
                                          ? `${assignmentCount} Tugas`
                                          : activeTab === 'exams'
                                            ? `${examCount} Ujian`
                                            : `${cls.students_count || 0} Siswa`;

                                const targetUrl =
                                    activeTab === 'materials'
                                        ? `/teacher/subjects/${subject.id}/classrooms/${cls.id}/materials?tab=materials`
                                        : activeTab === 'assignments'
                                          ? `/teacher/subjects/${subject.id}/classrooms/${cls.id}/assignments?tab=assignments`
                                          : activeTab === 'exams'
                                            ? `/teacher/subjects/${subject.id}/classrooms/${cls.id}/exams?tab=exams`
                                            : `/teacher/subjects/${subject.id}/classrooms/${cls.id}/progress`;

                                const actionLabel =
                                    activeTab === 'progress'
                                        ? 'Lihat Progres Siswa'
                                        : 'Buka Manajemen';

                                return (
                                    <motion.div
                                        key={cls.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Link href={targetUrl}>
                                            <Card className="p-4 overflow-hidden border border-zinc-200/80 bg-card/50 shadow-md hover:shadow-xl backdrop-blur-sm transition-all cursor-pointer hover:border-primary/50 group flex flex-col justify-between h-full">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-mono font-bold px-2 py-0.5 text-[11px] border border-blue-200 dark:border-blue-800">
                                                            {cls.major_code}
                                                        </Badge>
                                                        <Badge
                                                            variant="secondary"
                                                            className={
                                                                activeTab === 'progress'
                                                                    ? 'text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                                                    : 'text-[10px]'
                                                            }
                                                        >
                                                            {badgeLabel}
                                                        </Badge>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                            {cls.name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            T.A {cls.academic_year}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="pt-3 mt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-primary">
                                                    <span>{actionLabel}</span>
                                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <Card className="border-none bg-card/50 p-12 text-center shadow-xl backdrop-blur-sm space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                            <School className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold">Belum Ada Rombel Kelas Diajar</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Tambahkan rombel kelas yang diajar untuk mata pelajaran ini agar Anda dapat memantau materi, tugas, ujian, dan progress siswa khusus kelas tersebut.
                            </p>
                        </div>
                        {canManage && (
                            <Button onClick={handleOpenManageClasses} className="gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" />
                                <span>Tambah Kelas Diajar Sekarang</span>
                            </Button>
                        )}
                    </Card>
                )}
            </div>

            {/* Modal Manage Subject Classrooms grouped by Major */}
            <Dialog open={isManageClassesOpen} onOpenChange={setIsManageClassesOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <School className="h-5 w-5 text-primary" />
                            Kelola Rombel Kelas Diajar
                        </DialogTitle>
                        <DialogDescription>
                            Pilih rombel-rombel kelas per jurusan yang diajar pada mata pelajaran <strong>{subject.title}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveClassrooms} className="space-y-4 pt-2">
                        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                            {classroomsByMajor.length > 0 ? (
                                classroomsByMajor.map((group) => {
                                    const isExpanded = expandedMajorCode === group.major_code;
                                    const selectedCountInMajor = group.items.filter((item) =>
                                        selectedClassIds.includes(item.id)
                                    ).length;

                                    return (
                                        <div
                                            key={group.major_code}
                                            className="rounded-xl border border-zinc-200/80 bg-background/50 overflow-hidden dark:border-zinc-800"
                                        >
                                            {/* Accordion Header */}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedMajorCode(isExpanded ? null : group.major_code)
                                                }
                                                className="w-full flex items-center justify-between p-3 text-left font-bold text-xs bg-muted/30 hover:bg-muted/60 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    <span>
                                                        {group.major_code} - {group.major_name} ({group.items.length} Kelas)
                                                    </span>
                                                    {selectedCountInMajor > 0 && (
                                                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] py-0 px-2">
                                                            {selectedCountInMajor} dipilih
                                                        </Badge>
                                                    )}
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </button>

                                            {/* Accordion Content */}
                                            {isExpanded && (
                                                <div className="p-3 space-y-2 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-background">
                                                    {group.items.map((cls) => {
                                                        const isSelected = selectedClassIds.includes(cls.id);

                                                        return (
                                                            <div
                                                                key={cls.id}
                                                                onClick={() => toggleClassroomSelect(cls.id)}
                                                                className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                                                                    isSelected
                                                                        ? 'border-primary/50 bg-primary/5 font-semibold'
                                                                        : 'border-zinc-200/60 bg-background hover:bg-muted/50 dark:border-zinc-800'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={() => {}}
                                                                        className="rounded border-zinc-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <div>
                                                                        <p className="text-xs font-bold text-foreground">
                                                                            {cls.name}
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            T.A {cls.academic_year}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {isSelected && (
                                                                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px]">
                                                                        Terpilih
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="p-4 text-center text-xs text-muted-foreground">
                                    Belum ada data rombel kelas terdaftar di sistem.
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsManageClassesOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingClasses}
                                className="shadow-lg shadow-primary/20"
                            >
                                Simpan Perubahan Kelas
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Export Modal with Classroom Selector */}
            <ExportReportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                subjectId={subject.id}
                subjectTitle={subject.title}
                classrooms={classrooms}
            />
        </>
    );
}
