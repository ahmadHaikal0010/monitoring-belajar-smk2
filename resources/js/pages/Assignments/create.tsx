import { Head, Link, useForm, setLayoutProps } from '@inertiajs/react';
import {
    ArrowLeft,
    Save,
    BookOpen,
    FileText,
    Clock,
    Award,
    Loader2,
    CheckSquare,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface Props {
    subjects: Subject[];
}

export default function CreateAssignment({ subjects = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        subject_id: subjects.length > 0 ? subjects[0].id : '',
        title: '',
        description: '',
        due_date: '',
        max_score: 100,
        allowed_file_types: ['image', 'pdf'],
        status: 'published',
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Manajemen Tugas', href: '/teacher/assignments' },
            { title: 'Buat Tugas Baru', href: '/teacher/assignments/create' },
        ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/teacher/assignments');
    };

    const handleFileTypeToggle = (type: string) => {
        const current = [...data.allowed_file_types];

        if (current.includes(type)) {
            if (current.length > 1) {
                setData(
                    'allowed_file_types',
                    current.filter((t) => t !== type)
                );
            }
        } else {
            setData('allowed_file_types', [...current, type]);
        }
    };

    return (
        <>
            <Head title="Buat Tugas Baru" />

            <div className="mx-auto max-w-4xl space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href="/teacher/assignments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Buat Tugas Baru</h1>
                        <p className="text-sm text-muted-foreground">
                            Susun instruksi tugas, batas pengumpulan, dan nilai maksimal untuk siswa.
                        </p>
                    </div>
                </div>

                <Card className="border-none bg-card/50 p-6 shadow-xl backdrop-blur-sm">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Judul Tugas */}
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="flex items-center gap-2 font-semibold">
                                <FileText className="h-4 w-4 text-primary" />
                                Judul Tugas <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Contoh: Tugas 1 - Laporan Screenshot & PDF"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                autoFocus
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* Mata Pelajaran */}
                        <div className="grid gap-2">
                            <Label htmlFor="subject_id" className="flex items-center gap-2 font-semibold">
                                <BookOpen className="h-4 w-4 text-primary" />
                                Mata Pelajaran <span className="text-destructive">*</span>
                            </Label>
                            <select
                                id="subject_id"
                                className="flex h-11 w-full rounded-md border border-zinc-200 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900"
                                value={data.subject_id}
                                onChange={(e) => setData('subject_id', e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Mata Pelajaran --</option>
                                {subjects.map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.title} ({sub.code})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.subject_id} />
                        </div>

                        {/* Deskripsi & Instruksi */}
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-semibold">
                                Petunjuk / Instruksi Pengerjaan
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Tuliskan petunjuk pengerjaan tugas untuk siswa secara jelas..."
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            <InputError message={errors.description} />
                        </div>

                        {/* Tenggat Waktu & Nilai Maksimal */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="due_date" className="flex items-center gap-2 font-semibold">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Tenggat Pengumpulan (Deadline)
                                </Label>
                                <Input
                                    id="due_date"
                                    type="datetime-local"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                />
                                <InputError message={errors.due_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="max_score" className="flex items-center gap-2 font-semibold">
                                    <Award className="h-4 w-4 text-emerald-500" />
                                    Nilai Maksimal <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="max_score"
                                    type="number"
                                    min={10}
                                    max={1000}
                                    value={data.max_score}
                                    onChange={(e) => setData('max_score', parseInt(e.target.value) || 100)}
                                    required
                                />
                                <InputError message={errors.max_score} />
                            </div>
                        </div>

                        {/* Tipe Berkas yang Diizinkan */}
                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2 font-semibold">
                                <CheckSquare className="h-4 w-4 text-primary" />
                                Format Berkas Pengumpulan Ditolak/Diterima
                            </Label>
                            <div className="flex items-center gap-4 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.allowed_file_types.includes('image')}
                                        onChange={() => handleFileTypeToggle('image')}
                                        className="h-4 w-4 rounded border-zinc-300 text-primary"
                                    />
                                    <span>Foto / Gambar (Bulk Upload)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                                    <input
                                        type="checkbox"
                                        checked={data.allowed_file_types.includes('pdf')}
                                        onChange={() => handleFileTypeToggle('pdf')}
                                        className="h-4 w-4 rounded border-zinc-300 text-primary"
                                    />
                                    <span>Dokumen PDF</span>
                                </label>
                            </div>
                        </div>

                        {/* Status Publikasi */}
                        <div className="grid gap-2">
                            <Label htmlFor="status" className="font-semibold">
                                Status Publikasi
                            </Label>
                            <select
                                id="status"
                                className="flex h-11 w-full rounded-md border border-zinc-200 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-zinc-800 dark:bg-zinc-900"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="published">Langsung Diterbitkan (Published)</option>
                                <option value="draft">Simpan Sebagai Draft</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" asChild>
                                <Link href="/teacher/assignments">Batal</Link>
                            </Button>
                            <Button type="submit" disabled={processing} className="gap-2 shadow-lg shadow-primary/20">
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>Simpan Tugas</span>
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
}
