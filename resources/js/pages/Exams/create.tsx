import { Head, useForm, setLayoutProps } from '@inertiajs/react';
import { ArrowLeft, Save, FileQuestion } from 'lucide-react';
import { ExamSchedulePicker } from '@/components/ExamSchedulePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface Props {
    subject: Subject;
}

export default function ExamCreate({ subject }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        subject_id: subject.id,
        title: '',
        description: '',
        duration: 60,
        pass_score: 75,
        randomize_questions: false,
        randomize_options: false,
        status: 'published',
        start_time: '',
        end_time: '',
    });

    setLayoutProps({
        breadcrumbs: [
            { title: 'Manajemen Ujian', href: '/teacher/exams' },
            { title: subject.title, href: `/teacher/exams?subject_id=${subject.id}` },
            { title: 'Buat Ujian', href: `/teacher/exams/create?subject_id=${subject.id}` },
        ],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/exams');
    };

    return (
        <>
            <Head title={`Buat Ujian Baru - ${subject.title}`} />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Buat Ujian Baru</h1>
                        <p className="text-muted-foreground text-sm">
                            Mata Pelajaran: <span className="font-semibold text-foreground">{subject.title}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileQuestion className="h-5 w-5 text-primary" />
                                Informasi Utama Ujian
                            </CardTitle>
                            <CardDescription>Atur judul, deskripsi, durasi, dan KKM ujian.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Ujian <span className="text-destructive">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Ujian Tengah Semester Pemrograman Web"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Petunjuk / Deskripsi Pengerjaan</Label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    placeholder="Instruksi untuk siswa sebelum dan selama mengerjakan ujian..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background/50 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Durasi (Menit) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min={1}
                                        max={300}
                                        value={data.duration}
                                        onChange={(e) => setData('duration', parseInt(e.target.value) || 0)}
                                        className={errors.duration ? 'border-destructive' : ''}
                                    />
                                    {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pass_score">Nilai KKM (Kelulusan)</Label>
                                    <Input
                                        id="pass_score"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={data.pass_score}
                                        onChange={(e) => setData('pass_score', parseInt(e.target.value) || 0)}
                                        className={errors.pass_score ? 'border-destructive' : ''}
                                    />
                                    {errors.pass_score && <p className="text-xs text-destructive">{errors.pass_score}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status Publikasi</Label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value as any)}
                                        className="w-full h-10 rounded-md border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="published">Diterbitkan (Published)</option>
                                        <option value="draft">Draft (Belum dapat diakses)</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Pengaturan Acak & Jadwal (Opsional)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.randomize_questions}
                                        onChange={(e) => setData('randomize_questions', e.target.checked)}
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                    />
                                    Acak Urutan Soal
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.randomize_options}
                                        onChange={(e) => setData('randomize_options', e.target.checked)}
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                                    />
                                    Acak Pilihan Jawaban (A-E)
                                </label>
                            </div>

                            <div className="pt-2">
                                <ExamSchedulePicker
                                    startTime={data.start_time}
                                    endTime={data.end_time}
                                    onStartTimeChange={(val) => setData('start_time', val)}
                                    onEndTimeChange={(val) => setData('end_time', val)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-2 shadow-lg shadow-primary/20">
                            {processing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Save className="h-4 w-4" />}
                            Simpan & Buat Ujian
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
