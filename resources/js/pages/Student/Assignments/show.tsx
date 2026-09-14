import { Head, Link, useForm, usePage, setLayoutProps } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Upload,
    FileText,
    Image as ImageIcon,
    FileCheck2,
    Trash2,
    Award,
    Check,
    X,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface Assignment {
    id: string;
    title: string;
    description?: string;
    due_date?: string;
    max_score: number;
    allowed_file_types: string[];
}

interface SubmissionFile {
    id: string;
    file_path: string;
    file_name: string;
    file_type: 'image' | 'pdf';
    file_size?: number;
}

interface Submission {
    id: string;
    status: 'submitted' | 'graded' | 'late' | 'returned';
    notes?: string;
    score?: number;
    feedback?: string;
    submitted_at: string;
    files: SubmissionFile[];
}

interface Props {
    subject: Subject;
    assignment: Assignment;
    submission?: Submission | null;
}

export default function StudentAssignmentShow({ subject, assignment, submission }: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Cek apakah tenggat waktu telah terlampaui
    const isPastDue = assignment.due_date ? new Date() > new Date(assignment.due_date) : false;

    const flashMessage = flash?.success || flash?.error;
    const showSuccess = Boolean(flashMessage && dismissedFlash !== flashMessage);

    // Set Breadcrumbs ke Layout Utama
    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Katalog Mapel', href: '/student/subjects' },
                { title: subject.title, href: `/student/subjects/${subject.id}` },
                { title: assignment.title, href: '#' },
            ],
        });
    }, [subject.id, subject.title, assignment.title]);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setDismissedFlash(flashMessage);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const { data, setData, post, processing, errors } = useForm({
        notes: submission?.notes || '',
        files: [] as File[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isPastDue) {
return;
}

        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles((prev) => [...prev, ...filesArray]);
            setData('files', [...data.files, ...filesArray]);
        }
    };

    const handleRemoveFile = (index: number) => {
        if (isPastDue) {
return;
}

        const updated = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updated);
        setData('files', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isPastDue) {
return;
}

        post(`/student/assignments/${assignment.id}/submit`);
    };

    return (
        <>
            <Head title={`Pengumpulan ${assignment.title} - Siswa`} />

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
                    {/* Left Column: Assignment Details & Instructions */}
                    <div className="space-y-6">
                        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-4 !flex-col !py-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" asChild>
                                    <Link href={`/student/subjects/${subject.id}`}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="space-y-1">
                                    <Badge className="bg-primary/10 text-primary font-mono text-[10px]">
                                        {subject.code} - {subject.title}
                                    </Badge>
                                    <h1 className="text-xl font-bold tracking-tight">{assignment.title}</h1>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center justify-between">
                                    <span>Tenggat Waktu:</span>
                                    <span
                                        className={cn(
                                            'font-semibold flex items-center gap-1',
                                            isPastDue ? 'text-destructive' : 'text-foreground'
                                        )}
                                    >
                                        <Clock className="h-3 w-3" />
                                        {assignment.due_date
                                            ? new Date(assignment.due_date).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'short',
                                                  year: 'numeric',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : 'Tidak ada'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Skor Maksimal:</span>
                                    <span className="font-bold text-primary">{assignment.max_score} Poin</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Format Diterima:</span>
                                    <div className="flex gap-1">
                                        {assignment.allowed_file_types.map((type) => (
                                            <Badge key={type} variant="outline" className="text-[9px] uppercase">
                                                {type}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-border">
                                <h3 className="font-bold text-xs">Instruksi Tugas:</h3>
                                <div className="text-xs text-muted-foreground bg-accent/30 p-4 rounded-xl border border-border/50 whitespace-pre-wrap leading-relaxed">
                                    {assignment.description || 'Tidak ada instruksi tertulis tambahan dari pengampu.'}
                                </div>
                            </div>
                        </Card>

                        {submission && submission.status === 'graded' && (
                            <Card className="p-6 border border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/20 shadow-lg space-y-3 !flex-col !py-6">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <Award className="h-5 w-5" />
                                    <h3 className="font-bold text-sm">Penilaian & Catatan Guru</h3>
                                </div>
                                <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                                    {submission.score}{' '}
                                    <span className="text-xs font-normal text-muted-foreground">
                                        / {assignment.max_score} Poin
                                    </span>
                                </div>
                                {submission.feedback && (
                                    <div className="text-xs text-emerald-900 dark:text-emerald-200 bg-white/60 dark:bg-black/30 p-3 rounded-lg border border-emerald-200/50">
                                        <p className="font-bold mb-0.5">Umpan Balik Guru:</p>
                                        <p>{submission.feedback}</p>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Submission Form & File Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-6 !flex-col !py-6">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <FileCheck2 className="h-5 w-5 text-primary" />
                                    <span>Form Pengumpulan Tugas</span>
                                </h2>

                                <div className="flex items-center gap-2">
                                    {isPastDue && (
                                        <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-none flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            <span>Terlewati / Ditutup</span>
                                        </Badge>
                                    )}

                                    {submission && (
                                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-none">
                                            Sudah Dikumpulkan ({new Date(submission.submitted_at).toLocaleDateString('id-ID')})
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Alert jika tenggat waktu sudah habis */}
                            {isPastDue && (
                                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                                    <div>
                                        <p className="font-bold">Batas Waktu Pengumpulan Telah Habis</p>
                                        <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                                            Waktu pengumpulan untuk tugas ini telah ditutup pada {new Date(assignment.due_date!).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Anda tidak dapat lagi mengirim atau merubah berkas.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {submission && submission.files.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Berkas Yang Telah Terkirim:</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {submission.files.map((file) => (
                                            <a
                                                key={file.id}
                                                href={file.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 rounded-xl border border-border bg-accent/20 hover:bg-accent/50 transition-colors flex items-center gap-3 group"
                                            >
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                    {file.file_type === 'image' ? (
                                                        <ImageIcon className="h-4 w-4" />
                                                    ) : (
                                                        <FileText className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1 text-xs">
                                                    <p className="font-semibold truncate group-hover:text-primary transition-colors">
                                                        {file.file_name}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">
                                                        {file.file_type}
                                                    </p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Unggah Berkas Baru (Foto / PDF):</Label>
                                    <div
                                        className={cn(
                                            'border-2 border-dashed rounded-2xl p-6 text-center transition-colors relative',
                                            isPastDue
                                                ? 'border-zinc-300 dark:border-zinc-800 bg-muted/40 cursor-not-allowed opacity-60'
                                                : 'border-border hover:border-primary/50 bg-accent/10'
                                        )}
                                    >
                                        <input
                                            type="file"
                                            multiple
                                            disabled={isPastDue}
                                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                                            onChange={handleFileChange}
                                            className={cn(
                                                'absolute inset-0 opacity-0 w-full h-full',
                                                isPastDue ? 'cursor-not-allowed' : 'cursor-pointer'
                                            )}
                                        />
                                        <Upload className={cn("h-8 w-8 mx-auto mb-2", isPastDue ? "text-muted-foreground" : "text-primary")} />
                                        <p className="text-xs font-bold">
                                            {isPastDue ? 'Pengumpulan Berkas Ditutup' : 'Klik atau seret foto / PDF ke sini'}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {isPastDue
                                                ? 'Batas waktu pengerjaan telah berakhir'
                                                : 'Mendukung upload banyak foto sekaligus (bulk images) & dokumen PDF (Maks. 10MB per file).'}
                                        </p>
                                    </div>
                                    {errors.files && <p className="text-xs text-destructive">{errors.files}</p>}
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">
                                            Berkas Siap Diunggah ({selectedFiles.length}):
                                        </Label>
                                        <div className="space-y-1.5">
                                            {selectedFiles.map((file, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <FileText className="h-4 w-4 text-primary shrink-0" />
                                                        <span className="truncate">{file.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            ({(file.size / 1024).toFixed(1)} KB)
                                                        </span>
                                                    </div>
                                                    {!isPastDue && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(idx)}
                                                            className="text-rose-500 hover:text-rose-700 p-1"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold">Catatan Pengumpulan (Opsional):</Label>
                                    <Textarea
                                        disabled={isPastDue}
                                        placeholder={
                                            isPastDue
                                                ? 'Sesi pengumpulan telah berakhir.'
                                                : 'Tambahkan pesan atau penjelasan singkat untuk guru pengampu...'
                                        }
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={3}
                                        className="text-xs"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || isPastDue || (selectedFiles.length === 0 && !submission)}
                                    className={cn(
                                        'w-full gap-2 shadow-md text-xs h-10',
                                        isPastDue
                                            ? 'bg-zinc-400 dark:bg-zinc-800 text-zinc-200 cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary/90 text-white'
                                    )}
                                >
                                    <FileCheck2 className="h-4 w-4" />
                                    <span>
                                        {isPastDue
                                            ? 'Pengumpulan Telah Ditutup'
                                            : submission
                                            ? 'Perbarui Pengumpulan Tugas'
                                            : 'Kirim Pengumpulan Tugas'}
                                    </span>
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
