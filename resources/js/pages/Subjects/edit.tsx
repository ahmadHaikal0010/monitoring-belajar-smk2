import { Head, Link, useForm, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    Save, 
    FileText,
    Loader2,
    X,
    AlertCircle,
    Fingerprint,
    BookOpen
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
    description: string;
}

interface Props {
    subject: Subject;
}

export default function EditSubject({ subject }: Props) {
    const { flash } = usePage().props as any;
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        title: subject?.title || '',
        code: subject?.code || '',
        description: subject?.description || '',
    });

    useEffect(() => {
        if (flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.error]);

    setLayoutProps({
        breadcrumbs: [
            { title: 'Mata Pelajaran', href: '/teacher/subjects' },
            { title: 'Edit', href: `/teacher/subjects/${subject?.id}/edit` },
        ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/teacher/subjects/${subject?.id}`);
    };

    return (
        <>
            <Head title="Edit Mata Pelajaran" />
            <div className="mx-auto flex max-w-6xl w-full flex-col gap-6 p-6">
                <AnimatePresence>
                    {showFlash && flash?.error && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive w-full">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5" />
                                    <p className="text-sm font-medium">{flash?.error}</p>
                                </div>
                                <button onClick={() => setShowFlash(false)}><X className="h-4 w-4" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4 w-full">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href="/teacher/subjects">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Mata Pelajaran</h1>
                </div>

                <form onSubmit={submit} className="grid gap-6 w-full">
                    <Card className="w-full p-6 border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="flex items-center gap-2 font-semibold">
                                    <BookOpen className="h-4 w-4 text-primary" /> 
                                    Nama Mapel
                                </Label>
                                <Input 
                                    id="title" 
                                    className="h-11 border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.title} 
                                    onChange={e => setData('title', e.target.value)} 
                                    required 
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code" className="flex items-center gap-2 font-semibold">
                                    <Fingerprint className="h-4 w-4 text-primary" /> 
                                    Kode Enrollment
                                </Label>
                                <Input 
                                    id="code" 
                                    className="h-11 font-mono border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.code} 
                                    onChange={e => setData('code', e.target.value.toUpperCase())} 
                                    required 
                                />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="flex items-center gap-2 font-semibold">
                                    <FileText className="h-4 w-4 text-primary" /> 
                                    Deskripsi
                                </Label>
                                <Textarea 
                                    id="description" 
                                    value={data.description} 
                                    onChange={e => setData('description', e.target.value)} 
                                    className="min-h-[120px] resize-none border-zinc-200 bg-background/50 dark:border-zinc-800" 
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    </Card>
                    <div className="flex justify-end gap-3 w-full">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href="/teacher/subjects">Batal</Link>
                        </Button>
                        <Button className="px-8 shadow-lg shadow-primary/20" disabled={processing}>
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} 
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
