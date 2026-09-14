import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Check,
    X,
    Clock,
    HelpCircle,
    Calendar,
    Award,
    AlertCircle,
    Play,
    FileText,
    CheckCircle2,
    Info,
    Infinity as InfinityIcon,
    RotateCw,
    BarChart3,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface ExamSession {
    id: string;
    status?: string;
    is_submitted?: boolean;
}

interface Exam {
    id: string;
    title: string;
    description?: string;
    duration?: number | null; // Dalam menit (bisa null jika tanpa batas)
    pass_score: number;
    start_time?: string | null; // Bisa null
    end_time?: string | null;   // Bisa null
    total_questions: number;
    is_submitted?: boolean;
    score?: number | null;
    session?: ExamSession | null; // Data sesi ujian aktif/selesai
}

interface Props {
    subject: Subject;
    exam: Exam;
}

export default function StudentExamShow({ subject, exam }: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);

    // ==========================================
    // 1. IMPLEMENTASI MEMORY TAB (SAFE FOR SSR/REACT)
    // ==========================================
    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem(`exam_tab_${exam.id}`);

            if (savedTab === 'info' || savedTab === 'rules') {
                return savedTab;
            }
        }

        return 'info';
    });

    // Fungsi untuk mengubah dan menyimpan tab aktif
    const handleTabChange = (tab: 'info' | 'rules') => {
        setActiveTab(tab);
        localStorage.setItem(`exam_tab_${exam.id}`, tab);
    };

    // ==========================================
    // 2. PENANGANAN UJIAN TANPA BATAS WAKTU & STATUS
    // ==========================================
    const hasSchedule = Boolean(exam.start_time && exam.end_time);
    const now = new Date();

    const startTime = exam.start_time ? new Date(exam.start_time) : null;
    const endTime = exam.end_time ? new Date(exam.end_time) : null;

    // Pengecekan status ketersediaan ujian
    const isUpcoming = hasSchedule && startTime ? now < startTime : false;
    const isEnded = hasSchedule && endTime ? now > endTime : false;
    // Jika tidak ada jadwal (hasSchedule = false), ujian otomatis BUKA (isOpen = true)
    const isOpen = !hasSchedule || (startTime !== null && endTime !== null && now >= startTime && now <= endTime);

    // Cek Status Pengerjaan Ujian
    const isSubmitted = exam.is_submitted || exam.session?.is_submitted || false;
    const hasActiveSession = Boolean(exam.session && !isSubmitted);

    // Helper format tanggal
    const formatDate = (dateString?: string | null) => {
        if (!dateString) {
            return 'Tanpa Batas';
        }

        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Auto-dismiss Flash Alert
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

    // Set Breadcrumbs Layout
    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Katalog Mapel', href: '/student/subjects' },
                { title: subject.title, href: `/student/subjects/${subject.id}` },
                { title: exam.title, href: '#' },
            ],
        });
    }, [subject.id, subject.title, exam.title]);

    const handleStartExam = () => {
        router.post(`/student/exams/${exam.id}/start`);
    };

    return (
        <>
            <Head title={`Detail Ujian - ${exam.title}`} />

            <div className="flex flex-col gap-6 p-6">
                {/* Flash Alert Banner */}
                <AnimatePresence>
                    {showSuccess && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div
                                className={cn(
                                    'mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm',
                                    flash?.success
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                                        : 'border-destructive/20 bg-destructive/10 text-destructive'
                                )}
                            >
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* SISI KIRI: Informasi Utama & Memory Tab */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-6 !flex-col !py-6">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                                <div className="flex items-center gap-4">
                                    {/* Tombol Back ke Halaman Subject Detail */}
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/student/subjects/${subject.id}`}>
                                            <ArrowLeft className="h-4 w-4" />
                                        </Link>
                                    </Button>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-primary/10 text-primary font-mono text-[10px]">
                                                {subject.code} - {subject.title}
                                            </Badge>
                                            {isSubmitted && (
                                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] gap-1 px-2 py-0.5">
                                                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                    <span>Sudah Dikerjakan</span>
                                                </Badge>
                                            )}
                                            {hasActiveSession && (
                                                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] gap-1 px-2 py-0.5 animate-pulse">
                                                    <RotateCw className="h-3 w-3 shrink-0 animate-spin" />
                                                    <span>Sedang Belangsung</span>
                                                </Badge>
                                            )}
                                        </div>
                                        <h1 className="text-2xl font-bold tracking-tight">
                                            {exam.title}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Navigasi Memory Tab */}
                            <div className="flex items-center gap-2 border-b border-border pb-1">
                                <button
                                    onClick={() => handleTabChange('info')}
                                    className={cn(
                                        'px-4 py-2 text-xs font-semibold rounded-lg transition-all',
                                        activeTab === 'info'
                                            ? 'bg-primary text-primary-foreground shadow'
                                            : 'text-muted-foreground hover:bg-accent/50'
                                    )}
                                >
                                    Detail & Deskripsi
                                </button>
                                <button
                                    onClick={() => handleTabChange('rules')}
                                    className={cn(
                                        'px-4 py-2 text-xs font-semibold rounded-lg transition-all',
                                        activeTab === 'rules'
                                            ? 'bg-primary text-primary-foreground shadow'
                                            : 'text-muted-foreground hover:bg-accent/50'
                                    )}
                                >
                                    Petunjuk Pengerjaan
                                </button>
                            </div>

                            {/* Tab Content 1: Info & Deskripsi */}
                            {activeTab === 'info' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {exam.description ? (
                                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-muted/80 dark:bg-zinc-900/90 text-foreground shadow-sm space-y-1">
                                            <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                                                <Info className="h-3.5 w-3.5" />
                                                <span>Deskripsi Ujian:</span>
                                            </p>
                                            <p className="text-xs leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
                                                {exam.description}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">
                                            Tidak ada deskripsi tambahan untuk ujian ini.
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                        <div className="p-3 rounded-xl border border-border bg-card/40 space-y-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-blue-500" />
                                                Durasi Pengerjaan
                                            </span>
                                            <p className="text-sm font-bold">
                                                {exam.duration ? `${exam.duration} Menit` : 'Tanpa Batas'}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-border bg-card/40 space-y-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <HelpCircle className="h-3 w-3 text-amber-500" />
                                                Total Soal
                                            </span>
                                            <p className="text-sm font-bold">{exam.total_questions} Soal</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-border bg-card/40 space-y-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Award className="h-3 w-3 text-emerald-500" />
                                                Nilai KKM
                                            </span>
                                            <p className="text-sm font-bold">{exam.pass_score} Poin</p>
                                        </div>
                                        <div className="p-3 rounded-xl border border-border bg-card/40 space-y-1">
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-purple-500" />
                                                Status Akses
                                            </span>
                                            <p className="text-sm font-bold">
                                                {!hasSchedule
                                                    ? 'Bebas Akses'
                                                    : isOpen
                                                    ? 'Berlangsung'
                                                    : isUpcoming
                                                    ? 'Akan Datang'
                                                    : 'Berakhir'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Tab Content 2: Petunjuk Ujian */}
                            {activeTab === 'rules' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl border border-border bg-accent/20 space-y-3 text-xs"
                                >
                                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Tata Tertib & Petunjuk Pengerjaan
                                    </h3>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
                                        <li>Pastikan koneksi internet Anda dalam keadaan stabil sebelum memulai ujian.</li>
                                        <li>
                                            {exam.duration
                                                ? `Waktu akan dihitung mundur selama ${exam.duration} menit sejak Anda menekan tombol Mulai Ujian.`
                                                : 'Ujian ini tidak memiliki batas waktu pengerjaan khusus.'}
                                        </li>
                                        <li>Jawaban Anda akan tersimpan secara otomatis setiap kali memilih opsi.</li>
                                        <li className="text-amber-600 dark:text-amber-400 font-medium">
                                            <strong>Sistem Pengawasan Otomatis:</strong> Ujian akan berjalan dalam mode Layar Penuh (Full Screen). Dilarang keras keluar dari layar penuh, berpindah tab, atau membuka aplikasi lain.
                                        </li>
                                        <li className="text-destructive font-semibold">
                                            <strong>Sanksi Pelanggaran:</strong> Setiap kali Anda berpindah tab atau keluar dari Full Screen, sistem akan memberikan peringatan. Jika mencapai <strong>maksimal 5 kali peringatan</strong>, ujian akan secara otomatis terhenti dan jawaban langsung terkumpul.
                                        </li>
                                        <li>Klik tombol <strong>Selesai Ujian</strong> jika telah menyelesaikan seluruh soal sebelum waktu habis.</li>
                                    </ul>
                                </motion.div>
                            )}
                        </Card>
                    </div>

                    {/* SISI KANAN: Panel Informasi Jadwal & Tombol Mulai */}
                    <div className="space-y-6">
                        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-6">
                            <h2 className="font-bold text-sm flex items-center gap-2 border-b border-border pb-3">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>Jadwal & Status Ujian</span>
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Waktu Mulai:</span>
                                    <span className="font-semibold">{formatDate(exam.start_time)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Waktu Selesai:</span>
                                    <span className="font-semibold">{formatDate(exam.end_time)}</span>
                                </div>
                            </div>

                            {/* Banner Pesan Sesuai Status Akses */}
                            {!hasSchedule && !isSubmitted && (
                                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs flex items-center gap-2">
                                    <InfinityIcon className="h-4 w-4 shrink-0" />
                                    <span>Ujian ini bebas jadwal. Anda dapat memulainya kapan saja.</span>
                                </div>
                            )}

                            {isUpcoming && (
                                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>Ujian belum dimulai. Silakan tunggu hingga jadwal dimulai.</span>
                                </div>
                            )}

                            {isEnded && !isSubmitted && (
                                <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                                    <X className="h-4 w-4 shrink-0" />
                                    <span>Batas waktu pelaksanaan ujian ini telah berakhir.</span>
                                </div>
                            )}

                            {/* Tombol Aksi Dinamis */}
                            <div className="pt-2 space-y-2">
                                {/* 1. JIKA SUDAH DISUBMIT -> TOMBOL LIHAT HASIL */}
                                {isSubmitted && (
                                    <Button
                                        asChild
                                        className="w-full gap-2 font-bold shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                                        size="lg"
                                    >
                                        <Link href={`/student/exams/sessions/${exam.session?.id || exam.id}/result`}>
                                            <BarChart3 className="h-4 w-4" />
                                            <span>Lihat Hasil Ujian</span>
                                        </Link>
                                    </Button>
                                )}

                                {/* 2. JIKA ADA SESI AKTIF TAPI BELUM DISUBMIT -> TOMBOL LANJUTKAN */}
                                {!isSubmitted && hasActiveSession && isOpen && (
                                    <Button
                                        onClick={handleStartExam}
                                        className="w-full gap-2 font-bold shadow-lg bg-amber-600 hover:bg-amber-700 text-white animate-pulse"
                                        size="lg"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                        <span>Lanjutkan Ujian</span>
                                    </Button>
                                )}

                                {/* 3. JIKA BELUM ADA SESI (SESI KOSONG) -> TOMBOL MULAI KERJAKAN */}
                                {!isSubmitted && !hasActiveSession && isOpen && (
                                    <Button
                                        onClick={handleStartExam}
                                        className="w-full gap-2 font-bold shadow-lg"
                                        size="lg"
                                    >
                                        <Play className="h-4 w-4 fill-current" />
                                        <span>Mulai Kerjakan Ujian</span>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
