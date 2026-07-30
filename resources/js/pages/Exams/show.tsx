import { Head, useForm, router, setLayoutProps } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Clock,
    Award,
    FileQuestion,
    Users,
    Pencil,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Check,
    AlertCircle,
    Calendar,
    BookOpen,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Option {
    id?: string;
    option_text: string;
    is_correct: boolean;
    order?: number;
}

interface Question {
    id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'essay';
    material_id?: string | null;
    material_title?: string | null;
    image_url?: string | null;
    score: number;
    order: number;
    options: Option[];
}

interface ExamSession {
    id: string;
    student_name: string;
    nisn: string;
    started_at: string;
    submitted_at?: string | null;
    total_score?: number | null;
    status: 'in_progress' | 'submitted' | 'graded' | 'timed_out';
}

interface ExamDetails {
    id: string;
    subject_id: string;
    subject_title: string;
    title: string;
    description?: string;
    duration: number;
    pass_score: number;
    randomize_questions: boolean;
    randomize_options: boolean;
    status: 'draft' | 'published' | 'archived';
    start_time?: string;
    end_time?: string;
    question_count: number;
    session_count: number;
    questions: Question[];
    sessions: ExamSession[];
}

interface MaterialOption {
    id: string;
    title: string;
}

interface Props {
    exam: ExamDetails;
    materials?: MaterialOption[];
}

export default function ExamShow({ exam, materials = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'questions' | 'sessions'>('questions');
    const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        question_text: '',
        material_id: '',
        question_type: 'multiple_choice' as 'multiple_choice' | 'essay',
        score: 1.0,
        image: null as File | null,
        options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
        ],
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Manajemen Ujian', href: '/teacher/exams' },
            { title: exam.subject_title, href: `/teacher/exams?subject_id=${exam.subject_id}` },
            { title: exam.title, href: `/teacher/exams/${exam.id}` },
        ],
    });

    const formatDate = (dateStr?: string) => {
        if (!dateStr) {
return null;
}

        const formatted = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
        const d = new Date(formatted);

        if (isNaN(d.getTime())) {
return null;
}

        return d.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleOpenCreateModal = () => {
        setEditingQuestion(null);
        reset();
        setImagePreview(null);
        setIsAddQuestionOpen(true);
    };

    const handleOpenEditModal = (q: Question) => {
        setEditingQuestion(q);
        setData({
            question_text: q.question_text,
            material_id: q.material_id || '',
            question_type: q.question_type,
            score: q.score,
            image: null,
            options: q.question_type === 'multiple_choice' && q.options?.length > 0
                ? q.options.map(o => ({ option_text: o.option_text, is_correct: Boolean(o.is_correct) }))
                : [
                    { option_text: '', is_correct: true },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                    { option_text: '', is_correct: false },
                ],
        });
        setImagePreview(q.image_url || null);
        setIsAddQuestionOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOptionTextChange = (index: number, text: string) => {
        const updated = [...data.options];
        updated[index].option_text = text;
        setData('options', updated);
    };

    const handleSetCorrectOption = (index: number) => {
        const updated = data.options.map((opt, idx) => ({
            ...opt,
            is_correct: idx === index,
        }));
        setData('options', updated);
    };

    const handleAddOptionField = () => {
        if (data.options.length < 5) {
            setData('options', [
                ...data.options,
                { option_text: '', is_correct: false },
            ]);
        }
    };

    const handleRemoveOptionField = (index: number) => {
        if (data.options.length > 2) {
            const updated = data.options.filter((_, idx) => idx !== index);

            if (!updated.some((o) => o.is_correct)) {
                updated[0].is_correct = true;
            }

            setData('options', updated);
        }
    };

    const handleSaveQuestion = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingQuestion) {
            post(`/teacher/exams/${exam.id}/questions/${editingQuestion.id}`, {
                onSuccess: () => {
                    setIsAddQuestionOpen(false);
                    setEditingQuestion(null);
                    reset();
                    setImagePreview(null);
                },
            });
        } else {
            post(`/teacher/exams/${exam.id}/questions`, {
                onSuccess: () => {
                    setIsAddQuestionOpen(false);
                    reset();
                    setImagePreview(null);
                },
            });
        }
    };

    const handleDeleteQuestion = () => {
        if (!questionToDelete) {
return;
}

        router.delete(`/teacher/exams/${exam.id}/questions/${questionToDelete.id}`, {
            onSuccess: () => setQuestionToDelete(null),
        });
    };

    return (
        <>
            <Head title={`${exam.title} - Bank Soal & Hasil`} />

            <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => router.get(`/teacher/exams?subject_id=${exam.subject_id}`)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
                                <Badge variant="outline" className={cn(
                                    "border-none font-semibold text-xs",
                                    exam.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                )}>
                                    {exam.status === 'published' ? 'Diterbitkan' : 'Draft'}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                                Mata Pelajaran: <span className="font-semibold text-foreground">{exam.subject_title}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2" onClick={() => router.get(`/teacher/exams/${exam.id}/edit`)}>
                            <Pencil className="h-4 w-4" />
                            <span>Edit Pengaturan Ujian</span>
                        </Button>
                        <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handleOpenCreateModal}>
                            <Plus className="h-4 w-4" />
                            <span>Tambah Soal</span>
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Durasi Pengerjaan</p>
                                <p className="text-lg font-bold">{exam.duration} Menit</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Nilai KKM</p>
                                <p className="text-lg font-bold">{exam.pass_score} Poin</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Jumlah Soal</p>
                                <p className="text-lg font-bold">{exam.questions?.length || 0} Soal</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm sm:col-span-2 lg:col-span-2">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div className="flex-1 text-xs">
                                <p className="text-muted-foreground font-semibold">Jadwal Akses Ujian (WIB / +07:00)</p>
                                <div className="flex flex-col gap-0.5 mt-0.5 font-medium text-foreground">
                                    <span>Buka: <strong className="text-primary">{formatDate(exam.start_time) || 'Langsung Dibuka'}</strong></span>
                                    <span>Tutup: <strong className="text-primary">{formatDate(exam.end_time) || 'Tidak Ada Batas'}</strong></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Header */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                            activeTab === 'questions'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileQuestion className="h-4 w-4" />
                        <span>Bank Soal ({exam.questions?.length || 0})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                            activeTab === 'sessions'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        <span>Hasil & Monitoring Siswa ({exam.sessions?.length || 0})</span>
                    </button>
                </div>

                {/* Tab 1: Questions Builder */}
                {activeTab === 'questions' && (
                    <div className="space-y-4">
                        {exam.questions && exam.questions.length > 0 ? (
                            exam.questions.map((question, idx) => (
                                <motion.div
                                    key={question.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm overflow-hidden">
                                        <div className="p-4 flex flex-row items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {question.question_type === 'multiple_choice' ? 'Pilihan Ganda' : 'Essay'}
                                                        </Badge>
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            Bobot: {question.score} Poin
                                                        </Badge>
                                                        {question.material_title && (
                                                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 gap-1">
                                                                <BookOpen className="h-3 w-3" />
                                                                <span>Materi: {question.material_title}</span>
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-base mt-2 whitespace-pre-wrap">{question.question_text}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    onClick={() => handleOpenEditModal(question)}
                                                    title="Edit Soal"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => setQuestionToDelete(question)}
                                                    title="Hapus Soal"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <CardContent className="space-y-3 pt-0">
                                            {question.image_url && (
                                                <div className="mt-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-md">
                                                    <img src={question.image_url} alt="Gambar Soal" className="max-h-60 object-contain w-full bg-black/5" />
                                                </div>
                                            )}

                                            {question.question_type === 'multiple_choice' && question.options && (
                                                <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                                                    {question.options.map((opt, optIdx) => {
                                                        const label = String.fromCharCode(65 + optIdx);

                                                        return (
                                                            <div
                                                                key={opt.id || optIdx}
                                                                className={cn(
                                                                    "flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                                                                    opt.is_correct
                                                                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium"
                                                                        : "border-zinc-200 bg-background/50 dark:border-zinc-800"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                                    opt.is_correct ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    {label}
                                                                </div>
                                                                <span className="flex-1">{opt.option_text}</span>
                                                                {opt.is_correct && (
                                                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            <Card className="p-12 text-center border-dashed border-2 bg-muted/20">
                                <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <h3 className="font-bold text-lg">Belum Ada Soal</h3>
                                <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                                    Klik tombol "Tambah Soal" di atas untuk mulai membuat soal Pilihan Ganda atau Essay untuk ujian ini.
                                </p>
                                <Button className="mt-4 gap-2" onClick={handleOpenCreateModal}>
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Soal Pertama</span>
                                </Button>
                            </Card>
                        )}
                    </div>
                )}

                {/* Tab 2: Student Sessions */}
                {activeTab === 'sessions' && (
                    <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-200 bg-muted/50 dark:border-zinc-800">
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Nama Siswa</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">NISN</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Status Sesi</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Waktu Selesai</th>
                                        <th className="p-4 font-bold text-muted-foreground uppercase tracking-wider">Nilai Total</th>
                                        <th className="p-4 text-right font-bold text-muted-foreground uppercase tracking-wider">Hasil KKM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {exam.sessions && exam.sessions.length > 0 ? (
                                        exam.sessions.map((session) => {
                                            const isPassed = (session.total_score || 0) >= exam.pass_score;

                                            return (
                                                <tr key={session.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-4 font-semibold">{session.student_name}</td>
                                                    <td className="p-4 text-xs font-mono text-muted-foreground">{session.nisn}</td>
                                                    <td className="p-4">
                                                        <Badge variant="outline" className={cn(
                                                            "border-none font-semibold text-[10px]",
                                                            session.status === 'submitted' || session.status === 'graded'
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : session.status === 'in_progress'
                                                                ? "bg-blue-100 text-blue-700"
                                                                : "bg-destructive/10 text-destructive"
                                                        )}>
                                                            {session.status === 'in_progress' ? 'Sedang Mengerjakan' : session.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-xs text-muted-foreground">
                                                        {session.submitted_at
                                                            ? new Date(session.submitted_at).toLocaleString('id-ID')
                                                            : '-'}
                                                    </td>
                                                    <td className="p-4 font-bold text-base">
                                                        {session.total_score !== null && session.total_score !== undefined
                                                            ? session.total_score
                                                            : '-'}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {session.total_score !== null && session.total_score !== undefined ? (
                                                            isPassed ? (
                                                                <Badge className="bg-emerald-600 text-white gap-1">
                                                                    <CheckCircle2 className="h-3 w-3" /> Lulus
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <XCircle className="h-3 w-3" /> Belum Lulus
                                                                </Badge>
                                                            )
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-muted-foreground italic">
                                                Belum ada siswa yang mengerjakan ujian ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Dialog Modal: Add / Edit Question */}
                <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {editingQuestion ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
                                {editingQuestion ? 'Edit Soal Ujian' : 'Tambah Soal Ujian'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingQuestion ? 'Ubah teks pertanyaan, materi terkait, tipe, bobot, atau opsi jawaban.' : 'Masukkan pertanyaan, pilihan materi terkait, tipe soal, gambar, dan pilihan jawaban.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveQuestion} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="question_type">Tipe Soal</Label>
                                    <select
                                        id="question_type"
                                        value={data.question_type}
                                        onChange={(e) => setData('question_type', e.target.value as any)}
                                        className="w-full h-10 rounded-md border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="multiple_choice">Pilihan Ganda</option>
                                        <option value="essay">Essay / Uraian</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="score">Bobot Poin</Label>
                                    <Input
                                        id="score"
                                        type="number"
                                        step="any"
                                        min={0.1}
                                        value={data.score}
                                        onChange={(e) => setData('score', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Material Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="material_id">Materi Terkait (Opsional untuk rekomendasi siswa)</Label>
                                <select
                                    id="material_id"
                                    value={data.material_id}
                                    onChange={(e) => setData('material_id', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">-- Tanpa Kaitan Materi --</option>
                                    {materials.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.title}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-muted-foreground">
                                    Jika diisi, siswa yang menjawab salah pada soal ini akan melihat rekomendasi materi ini di hasil ujiannya.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="question_text">Teks Pertanyaan <span className="text-destructive">*</span></Label>
                                <textarea
                                    id="question_text"
                                    rows={3}
                                    placeholder="Tuliskan pertanyaan di sini..."
                                    value={data.question_text}
                                    onChange={(e) => setData('question_text', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background/50 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {errors.question_text && <p className="text-xs text-destructive">{errors.question_text}</p>}
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="image">Gambar Pendukung Soal (Opsional)</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="cursor-pointer text-xs"
                                    />
                                </div>
                                {imagePreview && (
                                    <div className="relative mt-2 w-32 h-32 rounded-lg overflow-hidden border">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Multiple Choice Options */}
                            {data.question_type === 'multiple_choice' && (
                                <div className="space-y-3 pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-sm">Pilihan Jawaban (Pilih 1 Kunci Jawaban Benar)</Label>
                                        {data.options.length < 5 && (
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddOptionField} className="h-7 text-xs gap-1">
                                                <Plus className="h-3 w-3" /> Tambah Opsi
                                            </Button>
                                        )}
                                    </div>

                                    {data.options.map((opt, idx) => {
                                        const label = String.fromCharCode(65 + idx);

                                        return (
                                            <div key={idx} className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCorrectOption(idx)}
                                                    className={cn(
                                                        "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 transition-colors",
                                                        opt.is_correct
                                                            ? "bg-emerald-600 text-white border-emerald-600"
                                                            : "bg-muted text-muted-foreground border-input hover:border-emerald-500"
                                                    )}
                                                    title="Klik untuk jadikan Kunci Jawaban"
                                                >
                                                    {label}
                                                </button>

                                                <Input
                                                    placeholder={`Teks pilihan ${label}...`}
                                                    value={opt.option_text}
                                                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                                                    className="flex-1 h-9 text-sm"
                                                />

                                                {data.options.length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive shrink-0"
                                                        onClick={() => handleRemoveOptionField(idx)}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <DialogFooter className="mt-6 gap-2 sm:gap-0">
                                <Button type="button" variant="ghost" onClick={() => setIsAddQuestionOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="gap-2">
                                    {processing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Check className="h-4 w-4" />}
                                    {editingQuestion ? 'Simpan Perubahan' : 'Simpan Soal'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Dialog Modal: Confirm Delete Question */}
                <Dialog open={!!questionToDelete} onOpenChange={(open) => !open && setQuestionToDelete(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"><AlertCircle className="h-6 w-6 text-destructive" /></div>
                            <DialogTitle>Hapus Soal</DialogTitle>
                            <DialogDescription>Apakah Anda yakin ingin menghapus soal ini? Tindakan ini tidak dapat dibatalkan.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setQuestionToDelete(null)}>Batal</Button>
                            <Button variant="destructive" onClick={handleDeleteQuestion} className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Hapus Soal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
