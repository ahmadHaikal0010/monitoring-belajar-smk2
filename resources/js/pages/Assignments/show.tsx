import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Award,
    CheckCircle2,
    AlertCircle,
    User,
    FileCheck2,
    FileQuestion,
    Pencil,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Student {
    id: string;
    nisn: string;
    user?: {
        name: string;
        email: string;
    };
}

interface SubmissionFile {
    id: string;
    file_path: string;
    file_name: string;
    file_type: 'image' | 'pdf';
}

interface Submission {
    id: string;
    student_id: string;
    submitted_at: string;
    notes: string | null;
    score: number | null;
    feedback: string | null;
    status: 'submitted' | 'graded' | 'late' | 'returned';
    student?: Student;
    files?: SubmissionFile[];
}

interface Assignment {
    id: string;
    title: string;
    description: string;
    due_date: string | null;
    max_score: number;
    allowed_file_types: string[] | null;
    status: 'draft' | 'published' | 'archived';
    subject?: {
        id: string;
        title: string;
        code: string;
    };
    teacher?: {
        id: string;
        user?: {
            name: string;
        };
    };
}

interface Props {
    assignment: Assignment;
    submissions: Submission[];
}

export default function ShowAssignment({ assignment, submissions = [] }: Props) {
    const { flash } = usePage().props as any;
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash]);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Manajemen Tugas', href: '/teacher/assignments' },
            { title: assignment.title, href: `/teacher/assignments/${assignment.id}` },
        ],
    });

    const getSubmissionStatusBadge = (submission: Submission) => {
        if (submission.status === 'graded') {
            return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Sudah Dinilai
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                Perlu Dinilai
            </Badge>
        );
    };

    return (
        <>
            <Head title={`Detail Tugas - ${assignment.title}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-between rounded-xl p-4 text-sm font-medium border shadow-sm',
                                    flash?.success
                                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                        : 'border-destructive/20 bg-destructive/10 text-destructive'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    {flash?.success ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5" />
                                    )}
                                    <p>{flash?.success || flash?.error}</p>
                                </div>
                                <button
                                    onClick={() => setShowFlash(false)}
                                    className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href="/teacher/assignments">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                    {assignment.subject?.code}
                                </Badge>
                                <span className="text-xs text-muted-foreground">• {assignment.subject?.title}</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
                        </div>
                    </div>

                    <Button variant="outline" asChild className="gap-2">
                        <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span>Edit Tugas</span>
                        </Link>
                    </Button>
                </div>

                {/* Details Card */}
                <Card className="border-none bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Instruksi & Deskripsi Pengerjaan
                            </h4>
                            <p className="text-sm whitespace-pre-line text-foreground/90">
                                {assignment.description || 'Tidak ada deskripsi instruksi.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Tenggat Waktu</p>
                                    <p className="font-medium text-xs">
                                        {assignment.due_date
                                            ? new Date(assignment.due_date).toLocaleString('id-ID')
                                            : 'Tidak ditentukan'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-emerald-500" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Nilai Maksimal</p>
                                    <p className="font-semibold text-xs">{assignment.max_score} Poin</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <FileCheck2 className="h-4 w-4 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Pengumpulan</p>
                                    <p className="font-semibold text-xs">{submissions.length} Siswa</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold tracking-tight">Daftar Pengumpulan Siswa</h3>
                        <p className="text-xs text-muted-foreground">
                            Penilaian dilakukan secara manual oleh Guru.
                        </p>
                    </div>

                    {submissions.length > 0 ? (
                        <div className="grid gap-3">
                            {submissions.map((sub) => (
                                <Card
                                    key={sub.id}
                                    className="border-none bg-card/40 shadow-sm transition-all hover:bg-card/70"
                                >
                                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-base">
                                                    {sub.student?.user?.name || 'Siswa'}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>NISN: {sub.student?.nisn || '-'}</span>
                                                    <span>•</span>
                                                    <span>
                                                        Dikumpulkan:{' '}
                                                        {new Date(sub.submitted_at).toLocaleString('id-ID')}
                                                    </span>
                                                    {sub.files && sub.files.length > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-primary font-medium">
                                                                {sub.files.length} Berkas Dikirim
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-none pt-3 md:pt-0">
                                            <div className="flex items-center gap-3">
                                                {getSubmissionStatusBadge(sub)}
                                                {sub.score !== null && (
                                                    <div className="text-right">
                                                        <span className="text-xs text-muted-foreground block">Nilai</span>
                                                        <span className="font-bold text-emerald-600 text-lg">
                                                            {sub.score} / {assignment.max_score}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                size="sm"
                                                variant={sub.status === 'graded' ? 'outline' : 'default'}
                                                asChild
                                                className="gap-2 shadow-sm"
                                            >
                                                <Link
                                                    href={`/teacher/assignments/${assignment.id}/submissions/${sub.id}`}
                                                >
                                                    {sub.status === 'graded' ? (
                                                        <>
                                                            <Pencil className="h-4 w-4 text-emerald-600" />
                                                            <span>Ubah Penilaian</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileCheck2 className="h-4 w-4" />
                                                            <span>Periksa & Beri Nilai</span>
                                                        </>
                                                    )}
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                            <FileQuestion className="h-10 w-10 text-muted-foreground opacity-50 mb-2" />
                            <h4 className="font-medium text-base">Belum Ada Siswa Mengumpulkan</h4>
                            <p className="text-xs text-muted-foreground max-w-sm mt-1">
                                Tugas ini telah dipublikasikan. Berkas pengumpulan dari siswa akan muncul di sini.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
