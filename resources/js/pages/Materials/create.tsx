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

interface Subject {
    id: string;
    title: string;
}

interface Props {
    subject: Subject;
}

export default function CreateMaterial({ subject }: Props) {
    const { flash } = usePage().props as any;
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        subject_id: subject?.id,
        title: '',
        content_type: 'video',
        content_body_text: '',
        content_body_file: null as File | null,
        description: '',
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
            { title: 'Materi Pembelajaran', href: '/teacher/materials' },
            { title: subject?.title || 'Detail', href: `/teacher/materials?subject_id=${subject?.id}` },
            { title: 'Tambah Materi', href: `/teacher/materials/create?subject_id=${subject?.id}` },
        ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/teacher/materials', {
            forceFormData: true,
            onSuccess: () => reset('title', 'content_body_text', 'content_body_file', 'description'),
        });
    };

    return (
        <>
            <Head title="Tambah Materi Baru" />

            <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">

                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className={cn("mb-2 p-4 rounded-xl border flex justify-between", flash.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-destructive/10 text-destructive border-destructive/20")}>
                                <div className="flex gap-3 items-center">
                                    {flash.success ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5" />}
                                    <span className="text-sm font-medium">{flash.success || flash.error}</span>
                                </div>
                                <button onClick={() => setShowFlash(false)}><X className="h-4 w-4" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild><Link href={`/teacher/materials?subject_id=${subject?.id}`}><ArrowLeft className="h-4 w-4" /></Link></Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Materi</h1>
                        <p className="text-muted-foreground text-sm">Mapel: <span className="font-bold text-primary">{subject?.title}</span></p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="p-6 border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-primary" /> Judul Materi</Label>
                                <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} required autoFocus />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label className="flex items-center gap-2 font-semibold"><Settings2 className="h-4 w-4 text-primary" /> Jenis Konten</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['video', 'document', 'url'].map(type => (
                                        <button key={type} type="button" onClick={() => setData('content_type', type as any)} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all", data.content_type === type ? "border-primary bg-primary/5 text-primary" : "border-zinc-100 bg-zinc-50/50 text-muted-foreground hover:border-zinc-200")}>
                                            {type === 'video' ? <Video className="h-6 w-6" /> : type === 'document' ? <FileText className="h-6 w-6" /> : <LinkIcon className="h-6 w-6" />}
                                            <span className="text-xs font-bold uppercase tracking-wider">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                {(data.content_type === 'video' || data.content_type === 'document') && (
                                    <div className="space-y-2">
                                        <Label className="font-semibold">{data.content_type === 'video' ? 'File Video' : 'File PDF'}</Label>
                                        <div className="relative group/file">
                                            <Input type="file" accept={data.content_type === 'video' ? "video/*" : ".pdf"} className="h-11 cursor-pointer pt-2" onChange={e => setData('content_body_file', e.target.files?.[0] || null)} />
                                            <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <InputError message={errors.content_body_file} />
                                    </div>
                                )}

                                {data.content_type === 'url' && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 font-semibold"><LinkIcon className="h-4 w-4 text-primary" /> Tautan / URL</Label>
                                        <Input placeholder="https://..." value={data.content_body_text} onChange={e => setData('content_body_text', e.target.value)} />
                                        <InputError message={errors.content_body_text} />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label className="font-semibold">Ringkasan</Label>
                                <Textarea value={data.description} onChange={e => setData('description', e.target.value)} className="min-h-[100px]" />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}><Link href={`/teacher/materials?subject_id=${subject?.id}`}>Batal</Link></Button>
                        <Button className="px-8 shadow-lg" disabled={processing}>{processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Simpan</Button>
                    </div>
                </form>
            </div>
        </>
    );
}
