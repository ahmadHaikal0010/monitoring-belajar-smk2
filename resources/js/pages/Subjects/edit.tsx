import { Head, Link, useForm, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    Save, 
    BookOpen, 
    FileText,
    AlertCircle,
    Loader2,
    X
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
    description: string;
}

interface Props {
    subject: Subject;
}

export default function EditSubject({ subject }: Props) {
    const { flash } = usePage().props as any;
    const [showError, setShowError] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        title: subject.title || '',
        description: subject.description || '',
    });

    useEffect(() => {
        if (flash?.error) {
            const showTimer = setTimeout(() => setShowError(true), 0);
            const hideTimer = setTimeout(() => setShowError(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.error]);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Mata Pelajaran',
                href: '/teacher/subjects',
            },
            {
                title: 'Edit Mapel',
                href: `/teacher/subjects/${subject.id}/edit`,
            },
        ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/teacher/subjects/${subject.id}`);
    };

    return (
        <>
            <Head title={`Edit Mata Pelajaran: ${subject.title}`} />

            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
                {/* Global Error Message */}
                <AnimatePresence>
                    {showError && flash?.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-2 flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-sm font-medium">
                                    {flash.error}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowError(false)}
                                className="transition-opacity hover:opacity-70"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="shrink-0"
                    >
                        <Link href="/teacher/subjects">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Mata Pelajaran
                        </h1>
                        <p className="text-muted-foreground">
                            Perbarui informasi materi atau judul mata pelajaran yang sudah ada.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="border-none bg-card/50 p-6 shadow-xl backdrop-blur-sm">
                        <div className="grid gap-6">
                            {/* Judul Mata Pelajaran */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="title"
                                    className="flex items-center gap-2 text-sm font-semibold"
                                >
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Nama Mata Pelajaran
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Pemrograman Dasar Berbasis Objek"
                                    className="h-11 border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.title} />
                            </div>

                            {/* Deskripsi */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="description"
                                    className="flex items-center gap-2 text-sm font-semibold"
                                >
                                    <FileText className="h-4 w-4 text-primary" />
                                    Deskripsi Singkat
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Berikan ringkasan materi atau tujuan dari mata pelajaran ini..."
                                    className="min-h-[150px] resize-none border-zinc-200 bg-background/50 dark:border-zinc-800"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                />
                                <InputError message={errors.description} />
                                <p className="text-right text-[11px] text-muted-foreground">
                                    {data.description.length}/1000 karakter
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href="/teacher/subjects">Batal</Link>
                        </Button>
                        <Button
                            className="gap-2 px-8 shadow-lg shadow-primary/20"
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
