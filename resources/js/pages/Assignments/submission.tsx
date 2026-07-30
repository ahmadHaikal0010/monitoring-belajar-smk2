import { Head, Link, useForm, setLayoutProps } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    User,
    Clock,
    FileText,
    Award,
    FileCheck2,
    FileCode,
    ExternalLink,
    Loader2,
    MessageSquare,
    Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SubmissionFile {
    id: string;
    file_path: string;
    file_name: string;
    file_type: 'image' | 'pdf';
    file_size?: number;
    mime_type?: string;
}

interface Student {
    id: string;
    nisn: string;
    user?: {
        name: string;
        email: string;
    };
}

interface Submission {
    id: string;
    assignment_id: string;
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
    max_score: number;
    subject?: {
        title: string;
        code: string;
    };
}

interface Props {
    assignment: Assignment;
    submission: Submission;
}

export default function SubmissionGrading({ assignment, submission }: Props) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        score: submission.score !== null ? submission.score.toString() : '',
        feedback: submission.feedback || '',
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Manajemen Tugas', href: '/teacher/assignments' },
            { title: assignment.title, href: `/teacher/assignments/${assignment.id}` },
            { title: 'Penilaian Siswa', href: '#' },
        ],
    });

    const submitGrading = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/teacher/assignments/${assignment.id}/submissions/${submission.id}/grade`);
    };

    const getFileUrl = (filePath: string) => {
        if (filePath.startsWith('http')) {
            return filePath;
        }

        return `/storage/${filePath}`;
    };

    return (
        <>
            <Head title={`Penilaian Tugas - ${submission.student?.user?.name || 'Siswa'}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4 w-full">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href={`/teacher/assignments/${assignment.id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                                {assignment.subject?.code}
                            </Badge>
                            <span className="text-xs text-muted-foreground">• {assignment.title}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Penilaian Manual Hasil Tugas</h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left & Middle Column: Student Files & Work */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Student Details Card */}
                        <Card className="border-none bg-card/50 shadow-md backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">
                                            {submission.student?.user?.name}
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            NISN: {submission.student?.nisn || '-'} • Email: {submission.student?.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0 text-xs">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    <span>
                                        Dikumpulkan pada:{' '}
                                        <strong className="text-foreground">
                                            {new Date(submission.submitted_at).toLocaleString('id-ID')}
                                        </strong>
                                    </span>
                                </div>

                                {submission.notes && (
                                    <div className="rounded-lg border bg-muted/30 p-3 mt-2">
                                        <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5 text-primary" />
                                            Catatan Siswa:
                                        </p>
                                        <p className="text-muted-foreground italic">{submission.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Uploaded Files Section */}
                        <Card className="border-none bg-card/50 shadow-md backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <FileCheck2 className="h-5 w-5 text-primary" />
                                    Berkas Pengumpulan Tugas ({submission.files?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {submission.files && submission.files.length > 0 ? (
                                    <div className="grid gap-4">
                                        {/* Group Image Files for Bulk Display */}
                                        {submission.files.filter((f) => f.file_type === 'image').length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                    <ImageIcon className="h-3.5 w-3.5 text-primary" />
                                                    Foto / Gambar Terunggah (Bulk Photos):
                                                </h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {submission.files
                                                        .filter((f) => f.file_type === 'image')
                                                        .map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className="group relative overflow-hidden rounded-xl border bg-background/50 transition-all hover:shadow-md cursor-pointer"
                                                                onClick={() => setSelectedImage(getFileUrl(file.file_path))}
                                                            >
                                                                <img
                                                                    src={getFileUrl(file.file_path)}
                                                                    alt={file.file_name}
                                                                    className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                                    Klik untuk memperbesar
                                                                </div>
                                                                <div className="p-2 text-[10px] truncate font-mono text-muted-foreground border-t bg-card/80">
                                                                    {file.file_name}
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Group PDF Files */}
                                        {submission.files.filter((f) => f.file_type === 'pdf').length > 0 && (
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                                                    <FileCode className="h-3.5 w-3.5 text-rose-500" />
                                                    Dokumen PDF:
                                                </h4>
                                                <div className="grid gap-2">
                                                    {submission.files
                                                        .filter((f) => f.file_type === 'pdf')
                                                        .map((file) => (
                                                            <div
                                                                key={file.id}
                                                                className="flex items-center justify-between rounded-xl border bg-muted/20 p-3"
                                                            >
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                                                                        <FileText className="h-5 w-5" />
                                                                    </div>
                                                                    <div className="overflow-hidden">
                                                                        <p className="font-medium text-sm truncate">
                                                                            {file.file_name}
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            Format Dokumen PDF
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    asChild
                                                                    className="gap-1 text-xs shrink-0"
                                                                >
                                                                    <a
                                                                        href={getFileUrl(file.file_path)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                                        Buka Dokumen
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Tidak ada berkas yang diunggah.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Form Penilaian Manual */}
                    <div className="space-y-6">
                        <Card className="border-none bg-card/60 shadow-xl backdrop-blur-sm sticky top-6">
                            <CardHeader className="border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Award className="h-5 w-5 text-emerald-500" />
                                    Form Penilaian Manual Guru
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                <form onSubmit={submitGrading} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="score" className="font-semibold text-sm">
                                            Nilai (0 - {assignment.max_score}) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="score"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max={assignment.max_score}
                                            placeholder={`Masukkan angka (Max ${assignment.max_score})`}
                                            className="h-11 border-zinc-200 bg-background/50 font-bold text-lg text-emerald-600 dark:border-zinc-800"
                                            value={data.score}
                                            onChange={(e) => setData('score', e.target.value)}
                                            required
                                            autoFocus
                                        />
                                        <InputError message={errors.score} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="feedback" className="flex items-center gap-2 font-semibold text-sm">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            Catatan / Feedback Guru
                                        </Label>
                                        <Textarea
                                            id="feedback"
                                            placeholder="Berikan masukan, apreasiasi, atau saran perbaikan untuk siswa..."
                                            className="min-h-[120px] resize-none border-zinc-200 bg-background/50 dark:border-zinc-800 text-sm"
                                            value={data.feedback}
                                            onChange={(e) => setData('feedback', e.target.value)}
                                        />
                                        <InputError message={errors.feedback} />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full gap-2 h-11 text-sm font-semibold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Simpan Nilai Manual
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal Lightbox for Image Preview */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-background p-2">
                        <img
                            src={selectedImage}
                            alt="Preview Foto"
                            className="max-h-[85vh] w-full object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
