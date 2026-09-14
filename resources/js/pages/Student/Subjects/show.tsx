import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, BookOpen, FileCheck, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentAssignments from '@/pages/Student/Assignments';
import StudentExams from '@/pages/Student/Exams';
import StudentMaterials from '@/pages/Student/Materials';

interface Subject {
    id: string;
    title: string;
    code: string;
    description?: string;
}

interface MaterialItem {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    description?: string;
    created_at: string;
    is_completed: boolean;
}

interface AssignmentItem {
    id: string;
    title: string;
    due_date?: string;
    status?: string;
    submission_status?: string;
    is_submitted?: boolean;
    submission?: {
        id?: string;
        status?: string;
    } | null;
    description?: string;
}

interface ExamItem {
    id: string;
    title: string;
    duration: number;
    status?: string;
    student_session?: {
        id: string;
        status: string;
        total_score?: number;
    } | null;
    session?: {
        id: string;
        status: string;
    } | null;
    start_time?: string;
    end_time?: string;
    description?: string;
}

interface ProgressSection {
    completed: number;
    total: number;
    percentage: number;
}

interface Props {
    subject: Subject;
    materials: MaterialItem[];
    assignments?: AssignmentItem[];
    exams?: ExamItem[];
    progress?: {
        materials?: ProgressSection;
        assignments?: ProgressSection;
        exams?: ProgressSection;
        completed?: number;
        total?: number;
        percentage?: number;
    };
    unseenCounts?: {
        materials?: number;
        assignments?: number;
        exams?: number;
    };
}

export default function StudentSubjectShow({
    subject,
    materials = [],
    assignments = [],
    exams = [],
    progress,
    unseenCounts = { materials: 0, assignments: 0, exams: 0 },
}: Props) {
    // -------------------------------------------------------------
    // MEMORY TAB: Menyimpan tab aktif di localStorage berdasarkan ID Subject
    // -------------------------------------------------------------
    const storageKey = `student_subject_tab_${subject.id}`;

    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem(storageKey);

            if (savedTab && ['materials', 'assignments', 'exams'].includes(savedTab)) {
                return savedTab;
            }
        }

        return 'materials';
    });

    const handleTabChange = (val: string) => {
        setActiveTab(val);

        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, val);
        }
    };

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Katalog Mapel', href: '/student/subjects' },
                { title: subject.title, href: '#' },
            ],
        });
    }, [subject.title]);

    // 1. Kalkulasi Progres Materi
    const materialsProgress = progress?.materials ?? {
        completed: materials.filter((m) => m.is_completed).length,
        total: materials.length,
        percentage: materials.length
            ? Math.round((materials.filter((m) => m.is_completed).length / materials.length) * 100)
            : 0,
    };

    // 2. Kalkulasi Progres Tugas
    const completedAssignmentsCount = assignments.filter((a) => {
        if (a.is_submitted || Boolean(a.submission)) {
            return true;
        }

        const status = (
            a.submission_status ||
            a.submission?.status ||
            a.status ||
            ''
        ).toLowerCase();

        return ['completed', 'submitted', 'graded', 'late', 'returned', 'terkumpul'].includes(status);
    }).length;

    const assignmentsProgress = progress?.assignments ?? {
        completed: completedAssignmentsCount,
        total: assignments.length,
        percentage: assignments.length
            ? Math.round((completedAssignmentsCount / assignments.length) * 100)
            : 0,
    };

    // 3. Kalkulasi Progres Ujian
    const completedExamsCount = exams.filter((e) => {
        const status = (
            e.status ||
            e.student_session?.status ||
            e.session?.status ||
            ''
        ).toLowerCase();

        return ['completed', 'submitted', 'finished', 'graded', 'timed_out'].includes(status);
    }).length;

    const examsProgress = progress?.exams ?? {
        completed: completedExamsCount,
        total: exams.length,
        percentage: exams.length
            ? Math.round((completedExamsCount / exams.length) * 100)
            : 0,
    };

    return (
        <>
            <Head title={`${subject.title} - Siswa`} />

            <div className="flex flex-col gap-6 p-6 text-left">
                {/* Header Card */}
                <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-2xl relative overflow-hidden">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                        {/* Judul & Detail Subject */}
                        <div className="flex items-start gap-4 text-left min-w-0 flex-1">
                            <Button
                                variant="outline"
                                size="icon"
                                asChild
                                className="shrink-0 h-10 w-10 rounded-xl border-zinc-200 dark:border-zinc-800"
                            >
                                <Link href="/student/subjects">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-primary/10 text-primary font-mono font-bold border-none text-[11px] rounded-md px-2 py-0.5">
                                        {subject.code}
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white truncate">
                                    {subject.title}
                                </h1>
                                <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl leading-relaxed">
                                    {subject.description ||
                                        'Pelajari seluruh materi yang telah disusun oleh pengampu mata pelajaran.'}
                                </p>
                            </div>
                        </div>

                        {/* 3 Indikator Progres Clean Design */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0 pt-4 xl:pt-0 border-t xl:border-t-0 border-zinc-100 dark:border-zinc-800">
                            {/* Indikator Materi */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 min-w-[170px]">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-muted-foreground">Materi</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                                            {materialsProgress.percentage}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300"
                                            style={{ width: `${materialsProgress.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {materialsProgress.completed} dari {materialsProgress.total} Selesai
                                    </p>
                                </div>
                            </div>

                            {/* Indikator Tugas */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 min-w-[170px]">
                                <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <FileCheck className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-muted-foreground">Tugas</span>
                                        <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                                            {assignmentsProgress.percentage}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 transition-all duration-300"
                                            style={{ width: `${assignmentsProgress.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {assignmentsProgress.completed} dari {assignmentsProgress.total} Dikumpulkan
                                    </p>
                                </div>
                            </div>

                            {/* Indikator Ujian */}
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 min-w-[170px]">
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-muted-foreground">Ujian</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                            {examsProgress.percentage}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-300"
                                            style={{ width: `${examsProgress.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {examsProgress.completed} dari {examsProgress.total} Dikerjakan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Main Tabs Navigation & Content (Tersambung state activeTab & onValueChange) */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl h-auto flex flex-wrap sm:inline-flex justify-start">
                        <TabsTrigger
                            value="materials"
                            className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm flex items-center gap-2"
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Materi
                            {unseenCounts.materials ? (
                                <Badge className="bg-blue-500 text-white border-none text-[10px] px-1.5 py-0 rounded-full h-4 min-w-4 flex items-center justify-center">
                                    {unseenCounts.materials}
                                </Badge>
                            ) : null}
                        </TabsTrigger>

                        <TabsTrigger
                            value="assignments"
                            className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm flex items-center gap-2"
                        >
                            <FileCheck className="h-3.5 w-3.5" />
                            Tugas
                            {unseenCounts.assignments ? (
                                <Badge className="bg-amber-500 text-white border-none text-[10px] px-1.5 py-0 rounded-full h-4 min-w-4 flex items-center justify-center">
                                    {unseenCounts.assignments}
                                </Badge>
                            ) : null}
                        </TabsTrigger>

                        <TabsTrigger
                            value="exams"
                            className="rounded-lg px-4 py-2 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm flex items-center gap-2"
                        >
                            <GraduationCap className="h-3.5 w-3.5" />
                            Ujian
                            {unseenCounts.exams ? (
                                <Badge className="bg-emerald-500 text-white border-none text-[10px] px-1.5 py-0 rounded-full h-4 min-w-4 flex items-center justify-center">
                                    {unseenCounts.exams}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="materials" className="mt-0 focus-visible:outline-none">
                        <StudentMaterials materials={materials} />
                    </TabsContent>

                    <TabsContent value="assignments" className="mt-0 focus-visible:outline-none">
                        <StudentAssignments assignments={assignments} />
                    </TabsContent>

                    <TabsContent value="exams" className="mt-0 focus-visible:outline-none">
                        <StudentExams exams={exams} />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
