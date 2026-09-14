import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    XCircle,
    BookOpen,
    ArrowLeft,
    ChevronRight,
    Award,
    RotateCcw,
    CheckCircle2,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnswerDetail {
    id: number | string;
    question_id: string;
    selected_option_id?: string | null;
    essay_answer?: string | null;
    is_correct: boolean | number | string;
    score_earned?: number;
    question_text: string;
    question_type?: string;
    max_score?: number;
    material_id?: string | null;
    material_title?: string | null;
    selected_option_text?: string | null;
}

interface ResultData {
    id: string;
    exam_id: string;
    student_id: string;
    subject_id?: string | null; // Added subject_id
    started_at: string;
    submitted_at: string | null;
    total_score: number | string | null;
    status: string;
    exam_title: string;
    pass_score: number;
    duration: number;
    is_passed: boolean;
    answers?: AnswerDetail[];
}

interface Props {
    result: ResultData;
}

export default function ExamResultPage({ result }: Props) {
    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Ujian Online', href: '/student/exams' },
                { title: 'Hasil Evaluasi Ujian', href: '#' },
            ],
        });
    }, []);

    // Helper untuk konversi status kebenaran jawaban dari DB (1/0/"1"/"0"/true/false)
    const checkIsCorrect = (val: boolean | number | string): boolean => {
        if (typeof val === 'boolean') {
return val;
}

        if (typeof val === 'number') {
return val === 1;
}

        if (typeof val === 'string') {
return val === '1' || val.toLowerCase() === 'true';
}

        return false;
    };

    // 1. Ekstrak answers
    const answers = useMemo(() => result?.answers || [], [result]);
    const totalQuestions = answers.length;

    // 2. Hitung statistik
    const correctCount = useMemo(() => {
        return answers.filter((a) => checkIsCorrect(a.is_correct)).length;
    }, [answers]);

    const incorrectCount = totalQuestions - correctCount;
    const totalScoreNum = Number(result?.total_score || 0);

    const accuracyRate = useMemo(() => {
        if (!totalQuestions) {
return 0;
}

        return Math.round((correctCount / totalQuestions) * 100);
    }, [correctCount, totalQuestions]);

    // 3. Filter Soal Salah
    const wrongAnswers = useMemo(() => {
        return answers.filter((a) => !checkIsCorrect(a.is_correct));
    }, [answers]);

    // Tentukan URL Back (Fallback ke /student/subjects jika subject_id kosong)
    const backUrl = result?.subject_id
        ? `/student/exams/${result.exam_id}`
        : '/student/subjects';

    return (
        <>
            <Head title={`Hasil Ujian: ${result.exam_title}`} />

            <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-4xl mx-auto pb-12">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 shrink-0" asChild>
                            <Link href={backUrl}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <Badge variant="secondary" className="font-mono text-[10px] tracking-wider uppercase mb-1">
                                Evaluasi Ujian
                            </Badge>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                {result.exam_title}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Score Banner Hero */}
                <Card className={cn(
                    "relative overflow-hidden border-2 rounded-3xl p-6 sm:p-8 shadow-sm transition-all",
                    result.is_passed
                        ? "bg-gradient-to-br from-emerald-500/10 via-card to-emerald-500/5 border-emerald-500/30"
                        : "bg-gradient-to-br from-rose-500/10 via-card to-rose-500/5 border-rose-500/30"
                )}>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

                        {/* Circle Score Display */}
                        <div className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "relative flex flex-col items-center justify-center h-36 w-36 sm:h-40 sm:w-40 rounded-full border-4 shadow-inner bg-card/80 backdrop-blur-md",
                                result.is_passed ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-rose-500 text-rose-600 dark:text-rose-400"
                            )}>
                                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                                    {totalScoreNum}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                                    Poin Akhir
                                </span>
                            </div>

                            <Badge className={cn(
                                "px-4 py-1 rounded-full text-xs font-semibold shadow-sm",
                                result.is_passed
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-rose-600 hover:bg-rose-700 text-white"
                            )}>
                                {result.is_passed ? (
                                    <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Lulus KKM</span>
                                ) : (
                                    <span className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5" /> Remedial</span>
                                )}
                            </Badge>
                        </div>

                        {/* Summary Metrics */}
                        <div className="flex-1 space-y-4 w-full">
                            <div>
                                <h2 className="text-lg font-semibold">Ringkasan Hasil Evaluasi</h2>
                                <p className="text-xs text-muted-foreground">
                                    Batas nilai kelulusan minimal (KKM): <span className="font-bold text-foreground">{result.pass_score} Poin</span>.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="p-3 rounded-2xl bg-muted/50 border border-border/50 text-center md:text-left">
                                    <span className="text-[10px] text-muted-foreground font-medium block">Total Soal</span>
                                    <span className="text-lg font-bold text-foreground">{totalQuestions}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center md:text-left">
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium block">Jawaban Benar</span>
                                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{correctCount}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center md:text-left">
                                    <span className="text-[10px] text-rose-700 dark:text-rose-400 font-medium block">Jawaban Salah</span>
                                    <span className="text-lg font-bold text-rose-700 dark:text-rose-400">{incorrectCount}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-center md:text-left">
                                    <span className="text-[10px] text-primary font-medium block">Akurasi</span>
                                    <span className="text-lg font-bold text-primary">{accuracyRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Daftar Soal Salah ATAU Status Lulus Sempurna */}
                {wrongAnswers.length > 0 ? (
                    <Card className="p-6 border rounded-2xl bg-card shadow-sm space-y-4">
                        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-rose-500" />
                            Daftar Soal yang Perlu Dievaluasi ({wrongAnswers.length})
                        </h2>

                        <div className="space-y-3 pt-2">
                            {wrongAnswers.map((item, idx) => (
                                <motion.div
                                    key={item.id || idx}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="p-4 rounded-xl border border-rose-200/60 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-2 text-xs"
                                >
                                    <div className="flex items-start gap-2.5">
                                        <Badge variant="outline" className="border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                                            Soal #{idx + 1}
                                        </Badge>
                                        <p className="font-medium text-foreground leading-relaxed">
                                            {item.question_text}
                                        </p>
                                    </div>

                                    {item.material_title ? (
                                        <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-rose-200/40 dark:border-rose-900/30 mt-2">
                                            <span className="flex items-center gap-1 font-medium">
                                                <BookOpen className="h-3 w-3 text-primary" />
                                                Materi Terkait: <strong className="text-foreground">{item.material_title}</strong>
                                            </span>
                                            <Button asChild size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-primary">
                                                <Link href={`/student/materials/${item.material_id}`}>
                                                    Buka Materi <ChevronRight className="h-3 w-3 ml-0.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-muted-foreground italic pt-1">
                                            Sistem tidak menemukan tautan materi spesifik untuk soal ini.
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <Card className="p-8 border rounded-2xl bg-emerald-500/5 border-emerald-500/20 text-center space-y-2">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                        <h3 className="text-base font-bold text-foreground">Luar Biasa! Tidak Ada Soal Salah</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Anda telah menjawab semua soal dengan tepat. Tidak ada materi yang perlu di-remedial untuk ujian ini.
                        </p>
                    </Card>
                )}
            </div>
        </>
    );
}
