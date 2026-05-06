import { Head, Link, useForm, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    Save, 
    FileText,
    Video,
    Link as LinkIcon,
    Loader2,
    Upload,
    Settings2,
    X,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Material {
    id: string;
    subject_id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    content_body: string;
    description: string;
    subject_title: string;
}

interface Props {
    material: Material;
}

export default function EditMaterial({ material }: Props) {
    const { flash } = usePage().props as any;
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'patch',
        title: material.title || '',
        content_type: material.content_type || 'video',
        content_body_text: material.content_type === 'url' ? material.content_body : '',
        content_body_file: null as File | null,
        description: material.description || '',
    });

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.success, flash?.error]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Materi Pembelajaran',
                href: '/teacher/materials',
            },
            {
                title: material.subject_title,
                href: `/teacher/materials?subject_id=${material.subject_id}`,
            },
            {
                title: 'Edit Materi',
                href: `/teacher/materials/${material.id}/edit`,
            },
        ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use POST with _method patch because we might be sending files
        post(`/teacher/materials/${material.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={`Edit Materi: ${material.title}`} />

            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                {/* Flash Messages */}
                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className={cn(
                                "mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm",
                                flash.success 
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                            )}>
                                {flash.success ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowFlash(false)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href={`/teacher/materials?subject_id=${material.subject_id}`}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Edit Materi
                        </h1>
                        <p className="text-muted-foreground">
                            Mata Pelajaran: <span className="font-bold text-primary">{material.subject_title}</span>
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="border-none bg-card/50 p-6 shadow-xl backdrop-blur-sm">
                        <div className="grid gap-6">
                            {/* Judul Materi */}
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="flex items-center gap-2 text-sm font-semibold">
                                    <FileText className="h-4 w-4 text-primary" />
                                    Judul Materi
                                </Label>
                                <Input 
                                    id="title" 
                                    placeholder="Contoh: Pengenalan Dasar Framework Laravel" 
                                    className="h-11 border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Jenis Konten */}
                            <div className="grid gap-2">
                                <Label htmlFor="content_type" className="flex items-center gap-2 text-sm font-semibold">
                                    <Settings2 className="h-4 w-4 text-primary" />
                                    Jenis Konten
                                </Label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setData('content_type', 'video')}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                            data.content_type === 'video' 
                                                ? "border-primary bg-primary/5 text-primary" 
                                                : "border-zinc-100 bg-zinc-50/50 text-muted-foreground hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50"
                                        )}
                                    >
                                        <Video className="h-6 w-6" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Video</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('content_type', 'document')}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                            data.content_type === 'document' 
                                                ? "border-primary bg-primary/5 text-primary" 
                                                : "border-zinc-100 bg-zinc-50/50 text-muted-foreground hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50"
                                        )}
                                    >
                                        <FileText className="h-6 w-6" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Dokumen</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setData('content_type', 'url')}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                                            data.content_type === 'url' 
                                                ? "border-primary bg-primary/5 text-primary" 
                                                : "border-zinc-100 bg-zinc-50/50 text-muted-foreground hover:border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900/50"
                                        )}
                                    >
                                        <LinkIcon className="h-6 w-6" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Tautan</span>
                                    </button>
                                </div>
                                <InputError message={errors.content_type} />
                            </div>

                            {/* Isi Konten (Kondisional) */}
                            <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {(data.content_type === 'video' || data.content_type === 'document') && (
                                    <div className="space-y-2">
                                        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800/30 flex gap-3">
                                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                            <div className="text-xs text-blue-800 dark:text-blue-300">
                                                <p className="font-bold">File Saat Ini:</p>
                                                <p className="truncate opacity-80">{material.content_body}</p>
                                                <p className="mt-1">Unggah file baru hanya jika Anda ingin mengganti file yang sudah ada.</p>
                                            </div>
                                        </div>
                                        
                                        <Label htmlFor="content_body_file" className="text-sm font-semibold">
                                            {data.content_type === 'video' ? 'Ganti File Video' : 'Ganti File Modul'}
                                        </Label>
                                        <div className="relative group/file">
                                            <Input 
                                                id="content_body_file"
                                                type="file"
                                                accept={data.content_type === 'video' ? "video/*" : ".pdf,.doc,.docx,.ppt,.pptx"}
                                                className="h-12 border-zinc-200 bg-background/50 dark:border-zinc-800 cursor-pointer pt-2.5 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                                onChange={e => setData('content_body_file', e.target.files?.[0] || null)}
                                            />
                                            <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover/file:text-primary transition-colors" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            {data.content_type === 'video' 
                                                ? 'Format: MP4, WEBM, AVI (Maks. 50MB)' 
                                                : 'Format: PDF, DOCX, PPTX (Maks. 10MB)'}
                                        </p>
                                        <InputError message={errors.content_body_file} />
                                    </div>
                                )}

                                {data.content_type === 'url' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="content_body_text" className="text-sm font-semibold">Tautan Embed atau URL Luar</Label>
                                        <Input 
                                            id="content_body_text"
                                            placeholder="Contoh: https://www.youtube.com/embed/... atau https://google.com" 
                                            className="h-11 border-zinc-200 bg-background/50 dark:border-zinc-800"
                                            value={data.content_body_text}
                                            onChange={e => setData('content_body_text', e.target.value)}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Gunakan tautan "embed" untuk memutar video YouTube secara langsung, atau tautan standar untuk referensi lainnya.</p>
                                        <InputError message={errors.content_body_text} />
                                    </div>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="text-sm font-semibold">Ringkasan Materi (Opsional)</Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="Berikan gambaran singkat mengenai apa yang akan dipelajari siswa dalam materi ini..." 
                                    className="min-h-[120px] resize-none border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                                <p className="text-right text-[10px] text-muted-foreground">{data.description.length}/1000</p>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href={`/teacher/materials?subject_id=${material.subject_id}`}>
                                Batal
                            </Link>
                        </Button>
                        <Button className="gap-2 px-8 shadow-lg shadow-primary/20" disabled={processing}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
