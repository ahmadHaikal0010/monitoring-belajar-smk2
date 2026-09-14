import { Head, router } from '@inertiajs/react';
import {
    Clock,
    ShieldAlert,
    Maximize2,
    ChevronLeft,
    ChevronRight,
    Flag,
    CheckCircle2,
    Send,
    PlayCircle,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Option {
    id: string;
    option_text: string;
    order: number;
}

interface Question {
    id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'essay';
    image_path?: string | null;
    score: number;
    order: number;
    options: Option[];
}

interface Session {
    id: string;
    exam_id: string;
    started_at: string;
    duration_seconds: number;
    remaining_seconds: number;
    status: string;
}

interface Props {
    subject: { id: string; title: string; code: string };
    exam: { id: string; title: string; duration: number; pass_score: number };
    session: Session;
    questions: Question[];
    saved_answers: Record<string, { selected_option_id?: string | null; essay_answer?: string | null }>;
}

export default function SecureExamSessionPage({ subject, exam, session, questions, saved_answers }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, { selected_option_id?: string | null; essay_answer?: string | null }>>(
        saved_answers || {}
    );
    const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
    const [secondsLeft, setSecondsLeft] = useState<number>(session.remaining_seconds || exam.duration * 60);

    // Initial Fullscreen Overlay state
    const [isExamStarted, setIsExamStarted] = useState(false);

    // Anti-Cheat states
    const [cheatWarningCount, setCheatWarningCount] = useState(0);
    const [showCheatDialog, setShowCheatDialog] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isSubmittingRef = useRef(false);

    // Ref untuk melacak apakah ada modal/dialog yang sedang aktif
    const isDialogOpenRef = useRef(false);

    const currentQuestion = questions[currentIndex];

    // Sinkronkan Ref dengan state modal
    useEffect(() => {
        isDialogOpenRef.current = showCheatDialog || showSubmitModal || !isExamStarted;
    }, [showCheatDialog, showSubmitModal, isExamStarted]);

    // Request Fullscreen Helper
    const enterFullscreen = useCallback(() => {
        setShowCheatDialog(false);

        setTimeout(() => {
            const elem = containerRef.current || document.documentElement;

            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(() => {});
            } else if ((elem as any).webkitRequestFullscreen) {
                (elem as any).webkitRequestFullscreen();
            } else if ((elem as any).msRequestFullscreen) {
                (elem as any).msRequestFullscreen();
            }
        }, 100);
    }, []);

    // Helper Submit Ujian
    const executeSubmit = useCallback(() => {
        if (isSubmittingRef.current) {
return;
}

        isSubmittingRef.current = true;
        setIsSubmitting(true);

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        router.post(`/student/exams/sessions/${session.id}/submit`, {}, {
            onError: (errors) => {
                console.error('Submit error:', errors);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                setShowSubmitModal(false);
                alert('Gagal mengumpulkan ujian. Silakan coba beberapa saat lagi.');
            },
            onFinish: () => {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }
        });
    }, [session.id]);

    // Timer Loop
    useEffect(() => {
        if (!isExamStarted) {
return;
}

        timerRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    executeSubmit();

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isExamStarted, executeSubmit]);

    // Trigger Kecurangan
    const triggerCheatViolation = useCallback(() => {
        if (!isExamStarted || isSubmittingRef.current || isDialogOpenRef.current) {
return;
}

        setCheatWarningCount((prev) => {
            const nextCount = prev + 1;

            if (nextCount >= 5) {
                setShowCheatDialog(false);
                executeSubmit();
            } else {
                setShowCheatDialog(true);
            }

            return nextCount;
        });
    }, [isExamStarted, executeSubmit]);

    // Event Listener Fullscreen & Blur Window
    useEffect(() => {
        if (!isExamStarted || isSubmittingRef.current) {
return;
}

        let checkTimeout: NodeJS.Timeout | null = null;

        const handleCheck = () => {
            if (checkTimeout) {
clearTimeout(checkTimeout);
}

            checkTimeout = setTimeout(() => {
                if (isSubmittingRef.current || isDialogOpenRef.current) {
return;
}

                const isFS = Boolean(
                    document.fullscreenElement ||
                    (document as any).webkitFullscreenElement ||
                    (document as any).msFullscreenElement
                );

                if (!isFS || !document.hasFocus()) {
                    triggerCheatViolation();
                }
            }, 300);
        };

        const handleFullscreenChange = () => {
            handleCheck();
        };

        const handleVisibilityOrBlur = () => {
            if (document.hidden || !document.hasFocus()) {
                handleCheck();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        window.addEventListener('blur', handleVisibilityOrBlur);
        document.addEventListener('visibilitychange', handleVisibilityOrBlur);

        return () => {
            if (checkTimeout) {
clearTimeout(checkTimeout);
}

            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            window.removeEventListener('blur', handleVisibilityOrBlur);
            document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
        };
    }, [isExamStarted, triggerCheatViolation]);

    // Action Mulai Ujian
    const handleStartExam = () => {
        setIsExamStarted(true);
        enterFullscreen();
    };

    // Autosave Jawaban
    const saveAnswerToServer = useCallback(
        async (questionId: string, optionId?: string | null, essayText?: string | null) => {
            if (isSubmittingRef.current) {
return;
}

            try {
                await fetch(`/student/exams/sessions/${session.id}/answer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify({
                        question_id: questionId,
                        selected_option_id: optionId || null,
                        essay_answer: essayText || null,
                    }),
                });
            } catch (err) {
                console.error('Autosave error:', err);
            }
        },
        [session.id]
    );

    const handleSelectOption = (questionId: string, optionId: string) => {
        const updated = {
            ...answers,
            [questionId]: {
                ...answers[questionId],
                selected_option_id: optionId,
            },
        };
        setAnswers(updated);
        saveAnswerToServer(questionId, optionId, answers[questionId]?.essay_answer);
    };

    const handleEssayChange = (questionId: string, text: string) => {
        const updated = {
            ...answers,
            [questionId]: {
                ...answers[questionId],
                essay_answer: text,
            },
        };
        setAnswers(updated);
        saveAnswerToServer(questionId, answers[questionId]?.selected_option_id, text);
    };

    const toggleFlag = (questionId: string) => {
        setFlaggedQuestions((prev) => ({
            ...prev,
            [questionId]: !prev[questionId],
        }));
    };

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;

        if (h > 0) {
            return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
        }

        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const totalAnswered = Object.values(answers).filter(
        (a) => a.selected_option_id || (a.essay_answer && a.essay_answer.trim() !== '')
    ).length;

    return (
        <>
            <Head title={`Sesi Ujian: ${exam.title}`} />

            {/* Container Utama (Fullscreen Element) */}
            <div
                ref={containerRef}
                className="fixed inset-0 z-[9999] bg-background text-foreground select-none p-4 md:p-6 font-sans flex flex-col justify-between overflow-y-auto"
                onContextMenu={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                onPaste={(e) => e.preventDefault()}
            >
                {/* 1. OVERLAY MULAI UJIAN (IN-TREE) */}
                {!isExamStarted && (
                    <div className="fixed inset-0 z-[10000] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                        <Card className="max-w-lg w-full p-6 border-border shadow-2xl space-y-6">
                            <div className="flex justify-center">
                                <div className="p-4 bg-primary/10 text-primary rounded-full">
                                    <ShieldAlert className="h-12 w-12" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">{exam.title}</h2>
                                <p className="text-xs text-muted-foreground">{subject.title} ({subject.code})</p>
                            </div>
                            <div className="bg-muted/50 p-4 rounded-xl text-xs text-left space-y-2 border border-border">
                                <p className="font-semibold text-foreground">Ketentuan Keamanan Ujian:</p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li>Ujian harus dikerjakan dalam mode <strong>Layar Penuh (Fullscreen)</strong>.</li>
                                    <li>Maksimal pelanggaran keluar layar/pindah tab: <strong>5 Kali</strong>.</li>
                                    <li>Ujian akan <strong>otomatis dikumpulkan</strong> jika pelanggaran melebihi batas.</li>
                                </ul>
                            </div>
                            <Button
                                type="button"
                                onClick={handleStartExam}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 gap-2 text-sm cursor-pointer"
                            >
                                <PlayCircle className="h-5 w-5" />
                                <span>Mulai Pekerjaan & Masuk Fullscreen</span>
                            </Button>
                        </Card>
                    </div>
                )}

                {/* 2. MODAL PERINGATAN KECURANGAN (IN-TREE) */}
                {showCheatDialog && !isSubmitting && (
                    <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <Card className="max-w-md w-full p-6 border-red-500/40 bg-card shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-lg">
                                <ShieldAlert className="h-6 w-6" />
                                <span>Peringatan Keamanan Ujian!</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Anda terdeteksi keluar dari layar penuh (*fullscreen*) atau berpindah ke aplikasi/tab lain.
                                <br />
                                Pelanggaran Ke-<strong>{cheatWarningCount}</strong> dari maksimal <strong>5 kali</strong>.
                                <span className="block mt-2 font-semibold text-red-600 dark:text-red-400">
                                    Catatan: Jika Anda melanggar sebanyak 5 kali, sistem akan secara otomatis mengumpulkan lembar ujian Anda.
                                </span>
                            </p>
                            <div className="pt-2">
                                <Button
                                    type="button"
                                    onClick={enterFullscreen}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs gap-2 shadow-md active:scale-95 transition-transform cursor-pointer"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                    <span>Kembali ke Layar Penuh (Fullscreen)</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* HEADER TIMER */}
                <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border border-border rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                            {subject.code}
                        </Badge>
                        <div>
                            <h1 className="font-bold text-sm text-foreground">{exam.title}</h1>
                            <p className="text-[11px] text-muted-foreground">Mapel: {subject.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl border border-border">
                        <Clock className={cn("h-4 w-4", secondsLeft < 300 ? "text-red-600 animate-pulse" : "text-emerald-600 dark:text-emerald-400")} />
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase">Sisa Waktu</p>
                            <p className={cn("font-mono font-bold text-base", secondsLeft < 300 ? "text-red-600" : "text-emerald-600 dark:text-emerald-400")}>
                                {formatTime(secondsLeft)}
                            </p>
                        </div>
                    </div>
                </header>

                {/* MAIN CONTENT WORKSPACE */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                    {/* Area Soal */}
                    <div className="lg:col-span-3 flex flex-col justify-between gap-6">
                        <Card className="bg-card border-border p-6 rounded-2xl shadow-sm flex-1 flex flex-col justify-between">
                            {currentQuestion ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <div className="flex items-center gap-2">
                                            <span className="h-8 w-8 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                                                {currentIndex + 1}
                                            </span>
                                            <span className="text-xs text-muted-foreground">dari {questions.length} Soal</span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleFlag(currentQuestion.id)}
                                            className={cn(
                                                "text-xs gap-1.5 h-8 cursor-pointer",
                                                flaggedQuestions[currentQuestion.id]
                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                                                    : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Flag className="h-3.5 w-3.5" />
                                            <span>{flaggedQuestions[currentQuestion.id] ? 'Ragu-ragu (Aktif)' : 'Ragu-ragu'}</span>
                                        </Button>
                                    </div>

                                    {/* Pertanyaan & Gambar */}
                                    <div className="space-y-4">
                                        {currentQuestion.image_path && (
                                            <div className="max-h-64 overflow-hidden rounded-xl border border-border bg-muted/30">
                                                <img
                                                    src={`/storage/${currentQuestion.image_path}`}
                                                    alt="Gambar Soal"
                                                    className="w-full h-full object-contain max-h-64"
                                                />
                                            </div>
                                        )}

                                        <p className="text-sm md:text-base leading-relaxed text-foreground font-medium">
                                            {currentQuestion.question_text}
                                        </p>
                                    </div>

                                    {/* Pilihan / Essay */}
                                    {currentQuestion.question_type === 'multiple_choice' ? (
                                        <div className="space-y-2.5 pt-2">
                                            {currentQuestion.options.map((opt, idx) => {
                                                const letter = String.fromCharCode(65 + idx);
                                                const isSelected = answers[currentQuestion.id]?.selected_option_id === opt.id;

                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                                                        className={cn(
                                                            "p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-xs md:text-sm",
                                                            isSelected
                                                                ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                                                                : "bg-muted/30 border-border text-foreground hover:bg-muted/60"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "h-7 w-7 rounded-lg font-mono font-bold flex items-center justify-center text-xs shrink-0 border",
                                                            isSelected
                                                                ? "bg-primary text-primary-foreground border-primary"
                                                                : "bg-background text-muted-foreground border-border"
                                                        )}>
                                                            {letter}
                                                        </span>
                                                        <span>{opt.option_text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pt-2">
                                            <label className="text-xs font-bold text-foreground">Jawaban Essay Anda:</label>
                                            <Textarea
                                                placeholder="Tuliskan jawaban lengkap Anda di sini..."
                                                value={answers[currentQuestion.id]?.essay_answer || ''}
                                                onChange={(e) => handleEssayChange(currentQuestion.id, e.target.value)}
                                                rows={5}
                                                className="bg-background border-border text-foreground text-xs"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Navigasi Bawah */}
                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                                <Button
                                    type="button"
                                    disabled={currentIndex === 0}
                                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-muted text-xs h-9 gap-1 cursor-pointer"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Sebelumnya</span>
                                </Button>

                                {currentIndex < questions.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 gap-1 cursor-pointer"
                                    >
                                        <span>Selanjutnya</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={() => setShowSubmitModal(true)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-sm cursor-pointer"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        <span>Kumpulkan Ujian</span>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Navigasi Soal */}
                    <div className="space-y-4">
                        <Card className="bg-card border-border p-4 rounded-2xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="font-bold text-xs text-foreground">Navigasi Soal</h3>
                                <Badge variant="outline" className="text-[10px]">
                                    {totalAnswered} / {questions.length} Terjawab
                                </Badge>
                            </div>

                            <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
                                {questions.map((q, idx) => {
                                    const isCurrent = idx === currentIndex;
                                    const isAnswered = Boolean(
                                        answers[q.id]?.selected_option_id ||
                                        (answers[q.id]?.essay_answer && answers[q.id]?.essay_answer?.trim() !== '')
                                    );
                                    const isFlagged = Boolean(flaggedQuestions[q.id]);

                                    return (
                                        <button
                                            key={q.id}
                                            type="button"
                                            onClick={() => setCurrentIndex(idx)}
                                            className={cn(
                                                "h-9 rounded-xl font-mono text-xs font-bold transition-all relative flex items-center justify-center border cursor-pointer",
                                                isCurrent
                                                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary bg-primary/20 text-primary"
                                                    : isFlagged
                                                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/50"
                                                    : isAnswered
                                                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50"
                                                    : "bg-background text-muted-foreground border-border hover:border-primary/50"
                                            )}
                                        >
                                            {idx + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="pt-2 border-t border-border">
                                <Button
                                    type="button"
                                    onClick={() => setShowSubmitModal(true)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-2 shadow-sm cursor-pointer"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Selesaikan Ujian</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* 3. MODAL KONFIRMASI PENGUMPULAN UJIAN (IN-TREE) */}
                {showSubmitModal && (
                    <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <Card className="max-w-md w-full p-6 border-border bg-card shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                                <CheckCircle2 className="h-5 w-5" />
                                <span>Konfirmasi Pengumpulan Ujian</span>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian ini sekarang?
                            </p>

                            <div className="bg-muted/50 p-3 rounded-xl border border-border text-foreground text-xs space-y-1.5">
                                <div className="flex justify-between">
                                    <span>Total Soal:</span>
                                    <span className="font-bold">{questions.length} Soal</span>
                                </div>
                                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                    <span>Sudah Dijawab:</span>
                                    <span className="font-bold">{totalAnswered} Soal</span>
                                </div>
                                <div className="flex justify-between text-amber-600 dark:text-amber-400">
                                    <span>Ditandai Ragu:</span>
                                    <span className="font-bold">{Object.values(flaggedQuestions).filter(Boolean).length} Soal</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="text-xs h-9 cursor-pointer"
                                >
                                    Periksa Kembali
                                </Button>
                                <Button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={executeSubmit}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 cursor-pointer"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>{isSubmitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan Sekarang'}</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </>
    );
}
