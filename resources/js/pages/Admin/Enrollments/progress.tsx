import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Circle,
    FileText,
    Video,
    Link as LinkIcon,
    Clock,
    BookOpen,
    GraduationCap,
    TrendingUp,
    FileQuestion,
    XCircle,
    ClipboardList,
    Award,
    MessageSquare,
    Download,
} from 'lucide-react';
import { useState } from 'react';
import { ExportReportModal } from '@/components/ExportReportModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Material {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    description: string;
}

interface ExamResult {
    exam_id: string;
    exam_title: string;
    pass_score: number;
    duration: number;
    session_id?: string | null;
    session_status?: 'in_progress' | 'submitted' | null;
    total_score?: number | null;
    submitted_at?: string | null;
    started_at?: string | null;
    is_passed?: boolean | null;
}

interface AssignmentResult {
    assignment_id: string;
    assignment_title: string;
    max_score: number;
    due_date?: string | null;
    submission_id?: string | null;
    submission_status?: 'submitted' | 'graded' | 'late' | 'returned' | null;
    score?: number | null;
    feedback?: string | null;
    submitted_at?: string | null;
}

interface Enrollment {
    id: string;
    student_id: string;
    subject_id: string;
    status: string;
    student_name: string;
    subject_title: string;
    total_materials: number;
    completed_materials: number;
}

interface Props {
    enrollment: Enrollment;
    materials: Material[];
    completedMaterialIds: string[];
    examResults?: ExamResult[];
    assignmentResults?: AssignmentResult[];
}

export default function StudentProgressDetail({
    enrollment,
    materials = [],
    completedMaterialIds = [],
    examResults = [],
    assignmentResults = [],
}: Props) {
    const [activeTab, setActiveTab] = useState<'materials' | 'exams' | 'assignments'>('materials');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const percentage = Math.round((enrollment.completed_materials / (enrollment.total_materials || 1)) * 100);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Data Pendaftaran', href: '/admin/enrollments' },
            {
                title: enrollment.subject_title,
                href: `/admin/enrollments?subject_id=${enrollment.subject_id}`,
            },
            { title: 'Progres Siswa', href: '#' },
        ],
    });

    const getContentTypeIcon = (type: Material['content_type']) => {
        switch (type) {
            case 'video':
                return <Video className="h-4 w-4" />;
            case 'document':
                return <FileText className="h-4 w-4" />;
            case 'url':
                return <LinkIcon className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    return (
        <>
            <Head title={`Progres: ${enrollment.student_name}`} />

            <div className="flex flex-col gap-6 p-6 mx-auto max-w-6xl w-full">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={`/admin/enrollments?subject_id=${enrollment.subject_id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Detail Progres Belajar</h1>
                            <p className="text-muted-foreground text-sm">
                                Laporan pencapaian materi, hasil ujian, dan pengumpulan tugas secara personal.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsExportModalOpen(true)}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shrink-0"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Laporan Mapel</span>
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Student Info Card */}
                    <Card className="md:col-span-1 border-none bg-card/50 shadow-xl backdrop-blur-sm">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto mb-4 relative">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg mx-auto">
                                    <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary uppercase">
                                        {enrollment.student_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center text-white">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold">{enrollment.student_name}</h2>
                            <Badge variant="secondary" className="mt-2 font-bold uppercase tracking-wider text-[10px]">
                                SISWA
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Mata Pelajaran</span>
                                    <span className="font-bold">{enrollment.subject_title}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Status Pendaftaran</span>
                                    <span className="font-bold uppercase text-[10px] text-orange-600 tracking-wider">
                                        {enrollment.status}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress Stats Card */}
                    <Card className="md:col-span-2 border-none bg-card/50 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col justify-center p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative h-40 w-40 shrink-0">
                                <svg className="h-full w-full" viewBox="0 0 100 100">
                                    <circle
                                        className="text-muted/20 stroke-current"
                                        strokeWidth="8"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                    />
                                    <motion.circle
                                        className="text-primary stroke-current"
                                        strokeWidth="8"
                                        strokeDasharray="251.2"
                                        initial={{ strokeDashoffset: 251.2 }}
                                        animate={{ strokeDashoffset: 251.2 - (251.2 * percentage) / 100 }}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="40"
                                        cx="50"
                                        cy="50"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black">{percentage}%</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground text-center leading-none">
                                        Pencapaian
                                        <br />
                                        Materi
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        <GraduationCap className="h-6 w-6 text-primary" />
                                        Ringkasan Aktivitas Belajar
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Perkembangan materi, ujian, dan pengumpulan tugas siswa dalam satu tampilan teratur.
                                    </p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                                        <span className="text-xl font-black text-primary">
                                            {enrollment.completed_materials}/{enrollment.total_materials}
                                        </span>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Materi</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                        <span className="text-xl font-black text-emerald-600">
                                            {examResults.filter((e) => e.session_status === 'submitted').length}/{examResults.length}
                                        </span>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Ujian Selesai</p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
                                        <span className="text-xl font-black text-amber-600">
                                            {assignmentResults.filter((a) => a.submission_id).length}/{assignmentResults.length}
                                        </span>
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Tugas Dikumpul</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Tabbed Navigation Bar (UI/UX Optimized to Avoid Long Scrolling) */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('materials')}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
                                activeTab === 'materials'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <BookOpen className="h-4 w-4" />
                            <span>Materi Pembelajaran ({materials.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('exams')}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
                                activeTab === 'exams'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <FileQuestion className="h-4 w-4" />
                            <span>Hasil Ujian ({examResults.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('assignments')}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
                                activeTab === 'assignments'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                            )}
                        >
                            <ClipboardList className="h-4 w-4" />
                            <span>Tugas Siswa ({assignmentResults.length})</span>
                        </button>
                    </div>

                    {/* Tab Content Display */}
                    <div className="pt-4">
                        <AnimatePresence mode="wait">
                            {/* Tab 1: Materi Pembelajaran */}
                            {activeTab === 'materials' && (
                                <motion.div
                                    key="materials-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid gap-3"
                                >
                                    {materials.length > 0 ? (
                                        materials.map((material) => {
                                            const isCompleted = completedMaterialIds.includes(material.id);

                                            return (
                                                <Card
                                                    key={material.id}
                                                    className={cn(
                                                        'group border-none shadow-md transition-all',
                                                        isCompleted
                                                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                                                            : 'bg-card/50 hover:bg-card'
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4 p-4">
                                                        <div
                                                            className={cn(
                                                                'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors',
                                                                isCompleted
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : 'bg-primary/10 text-primary'
                                                            )}
                                                        >
                                                            {isCompleted ? (
                                                                <CheckCircle2 className="h-6 w-6" />
                                                            ) : (
                                                                getContentTypeIcon(material.content_type)
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold truncate text-base">
                                                                    {material.title}
                                                                </h4>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[9px] uppercase font-black tracking-widest px-1.5 h-4"
                                                                >
                                                                    {material.content_type}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                                {material.description || 'Tidak ada deskripsi.'}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0">
                                                            {isCompleted ? (
                                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                                                        SELESAI
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                    <Circle className="h-4 w-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                                                        BELUM
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <Card className="border-none shadow-md bg-card/50 p-6 text-center text-muted-foreground text-sm">
                                            Belum ada materi pembelajaran untuk mata pelajaran ini.
                                        </Card>
                                    )}
                                </motion.div>
                            )}

                            {/* Tab 2: Hasil Ujian */}
                            {activeTab === 'exams' && (
                                <motion.div
                                    key="exams-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid gap-3"
                                >
                                    {examResults.length > 0 ? (
                                        examResults.map((exam) => {
                                            const isSubmitted = exam.session_status === 'submitted';
                                            const isInProgress = exam.session_status === 'in_progress';
                                            const isPassed = exam.is_passed;

                                            return (
                                                <Card key={exam.exam_id} className="border-none shadow-md bg-card/50 hover:bg-card transition-all">
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={cn(
                                                                    'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner',
                                                                    isSubmitted && isPassed
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : isSubmitted && !isPassed
                                                                          ? 'bg-rose-500 text-white'
                                                                          : isInProgress
                                                                            ? 'bg-blue-500 text-white'
                                                                            : 'bg-primary/10 text-primary'
                                                                )}
                                                            >
                                                                {isSubmitted && isPassed ? (
                                                                    <CheckCircle2 className="h-6 w-6" />
                                                                ) : isSubmitted && !isPassed ? (
                                                                    <XCircle className="h-6 w-6" />
                                                                ) : isInProgress ? (
                                                                    <Clock className="h-6 w-6 animate-pulse" />
                                                                ) : (
                                                                    <FileQuestion className="h-6 w-6" />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <h4 className="font-bold text-base">{exam.exam_title}</h4>
                                                                    <Badge variant="outline" className="text-[10px]">
                                                                        Durasi: {exam.duration} Menit
                                                                    </Badge>
                                                                </div>

                                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                    <span>
                                                                        KKM: <strong className="text-foreground">{exam.pass_score}</strong>
                                                                    </span>
                                                                    {exam.submitted_at && (
                                                                        <span>
                                                                            • Selesai:{' '}
                                                                            {new Date(exam.submitted_at).toLocaleString('id-ID', {
                                                                                day: 'numeric',
                                                                                month: 'short',
                                                                                year: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                                            {isSubmitted ? (
                                                                <div className="text-right">
                                                                    <div className="text-xl font-black">
                                                                        {exam.total_score !== null ? exam.total_score : 0}
                                                                        <span className="text-xs font-normal text-muted-foreground"> Poin</span>
                                                                    </div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={cn(
                                                                            'text-[10px] font-bold uppercase mt-0.5',
                                                                            isPassed
                                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                                                                        )}
                                                                    >
                                                                        {isPassed ? 'LULUS (>= KKM)' : 'TIDAK LULUS (< KKM)'}
                                                                    </Badge>
                                                                </div>
                                                            ) : isInProgress ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200"
                                                                >
                                                                    SEDANG DIKERJAKAN
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-muted-foreground">
                                                                    BELUM MENGIKUTI
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <Card className="border-none shadow-md bg-card/50 p-6 text-center text-muted-foreground text-sm">
                                            Belum ada ujian yang diterbitkan untuk mata pelajaran ini.
                                        </Card>
                                    )}
                                </motion.div>
                            )}

                            {/* Tab 3: Hasil Tugas Siswa */}
                            {activeTab === 'assignments' && (
                                <motion.div
                                    key="assignments-tab"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid gap-3"
                                >
                                    {assignmentResults.length > 0 ? (
                                        assignmentResults.map((assignment) => {
                                            const isGraded = assignment.submission_status === 'graded';
                                            const isSubmitted = Boolean(assignment.submission_id);

                                            return (
                                                <Card
                                                    key={assignment.assignment_id}
                                                    className="border-none shadow-md bg-card/50 hover:bg-card transition-all"
                                                >
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                                                        <div className="flex items-start gap-4">
                                                            <div
                                                                className={cn(
                                                                    'h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner',
                                                                    isGraded
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : isSubmitted
                                                                          ? 'bg-amber-500 text-white'
                                                                          : 'bg-primary/10 text-primary'
                                                                )}
                                                            >
                                                                {isGraded ? (
                                                                    <Award className="h-6 w-6" />
                                                                ) : isSubmitted ? (
                                                                    <Clock className="h-6 w-6" />
                                                                ) : (
                                                                    <ClipboardList className="h-6 w-6" />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <h4 className="font-bold text-base">
                                                                    {assignment.assignment_title}
                                                                </h4>
                                                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                                                                    <span>
                                                                        Nilai Max: <strong className="text-foreground">{assignment.max_score}</strong>
                                                                    </span>
                                                                    {assignment.due_date && (
                                                                        <span>
                                                                            • Tenggat:{' '}
                                                                            {new Date(assignment.due_date).toLocaleString('id-ID', {
                                                                                day: 'numeric',
                                                                                month: 'short',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {assignment.feedback && (
                                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                                                                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                                                                        <span className="italic">
                                                                            Catatan Guru: "{assignment.feedback}"
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                                            {isGraded ? (
                                                                <div className="text-right">
                                                                    <div className="text-xl font-black text-emerald-600">
                                                                        {assignment.score}
                                                                        <span className="text-xs font-normal text-muted-foreground">
                                                                            {' '}
                                                                            / {assignment.max_score}
                                                                        </span>
                                                                    </div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase mt-0.5"
                                                                    >
                                                                        SUDAH DINILAI
                                                                    </Badge>
                                                                </div>
                                                            ) : isSubmitted ? (
                                                                <div className="text-right">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold uppercase"
                                                                    >
                                                                        PERLU DINILAI
                                                                    </Badge>
                                                                    {assignment.submission_id && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            asChild
                                                                            className="h-7 text-xs block mt-1"
                                                                        >
                                                                            <Link
                                                                                href={`/teacher/assignments/${assignment.assignment_id}/submissions/${assignment.submission_id}`}
                                                                            >
                                                                                Beri Nilai →
                                                                            </Link>
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <Badge variant="outline" className="text-muted-foreground">
                                                                    BELUM MENGUMPULKAN
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            );
                                        })
                                    ) : (
                                        <Card className="border-none shadow-md bg-card/50 p-6 text-center text-muted-foreground text-sm">
                                            Belum ada tugas yang diterbitkan untuk mata pelajaran ini.
                                        </Card>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <ExportReportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    subjectId={enrollment.subject_id}
                    subjectTitle={enrollment.subject_title}
                />
            </div>
        </>
    );
}
