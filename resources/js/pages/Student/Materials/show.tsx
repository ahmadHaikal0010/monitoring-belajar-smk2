import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Check,
    X,
    ChevronRight,
    FileText,
    Info,
    Maximize2,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Subject {
    id: string;
    title: string;
    code: string;
}

interface Material {
    id: string;
    subject_id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    content: string;
    description?: string;
    created_at: string;
    is_completed: boolean;
}

interface SidebarMaterial {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    is_completed?: boolean;
}

interface Props {
    subject: Subject;
    material: Material;
    all_materials: SidebarMaterial[];
}

// Sub-komponen khusus PDF (Client-Side Rendering)
function PdfViewerClient({
    contentUrl,
    isCompletedState,
    onComplete,
}: {
    contentUrl: string;
    isCompletedState: boolean;
    onComplete: () => void;
}) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pdfLib, setPdfLib] = useState<any>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        import('react-pdf').then((mod) => {
            if (!isMounted) {
return;
}

            import('react-pdf/dist/Page/AnnotationLayer.css');
            import('react-pdf/dist/Page/TextLayer.css');

            mod.pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${mod.pdfjs.version}/pdf.worker.min.mjs`;

            setPdfLib(mod);
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const handlePdfScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;

        if (isAtBottom && !isCompletedState) {
            onComplete();
        }
    };

    const toggleFullScreen = () => {
        if (!pdfContainerRef.current) {
return;
}

        if (!document.fullscreenElement) {
            pdfContainerRef.current.requestFullscreen().catch((err) => {
                console.error(`Gagal fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (!pdfLib) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] border border-border rounded-2xl bg-neutral-900 text-white gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-xs">Menyiapkan pembaca PDF...</span>
            </div>
        );
    }

    const { Document, Page } = pdfLib;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/70 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Scroll hingga halaman terakhir di bawah untuk menyelesaikan materi</span>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleFullScreen}
                    className="h-8 gap-1.5 text-xs"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Layar Penuh</span>
                </Button>
            </div>

            <div
                ref={pdfContainerRef}
                onScroll={handlePdfScroll}
                className="w-full h-[700px] overflow-y-auto rounded-2xl border border-border bg-neutral-900 p-4 shadow-inner flex flex-col items-center"
            >
                <Document
                    file={contentUrl}
                    onLoadSuccess={({ numPages }: { numPages: number }) => setNumPages(numPages)}
                    loading={
                        <div className="flex flex-col items-center justify-center py-20 text-white gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <span className="text-xs">Memuat dokumen PDF...</span>
                        </div>
                    }
                    error={
                        <div className="text-red-400 py-10 text-xs">
                            Gagal memuat file PDF. Pastikan URL file valid.
                        </div>
                    }
                >
                    {Array.from(new Array(numPages || 0), (_, index) => (
                        <div key={`page_${index + 1}`} className="mb-4 shadow-md">
                            <Page
                                pageNumber={index + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={true}
                                width={750}
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
}

export default function StudentMaterialShow({ subject, material, all_materials }: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);

    const flashMessage = flash?.success || flash?.error;
    const showSuccess = Boolean(flashMessage && dismissedFlash !== flashMessage);
    const isCompletedState = material.is_completed;

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setDismissedFlash(flashMessage);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: 'Katalog Mapel', href: '/student/subjects' },
                { title: subject.title, href: `/student/subjects/${subject.id}/materials` },
                { title: material.title, href: '#' },
            ],
        });
    }, [subject.id, subject.title, material.title]);

    const handleMarkComplete = () => {
        if (isCompletedState) {
return;
}

        setIsCompletedState(true);
        router.post(
            `/student/materials/${material.id}/complete`,
            {},
            {
                preserveScroll: true,
                onError: () => setIsCompletedState(false),
            }
        );
    };

    const renderContentBody = () => {
        const getStorageUrl = (path: string) => {
            if (!path) {
return '';
}

            const cleanPath = path.startsWith('/') ? path : `/${path}`;

            return cleanPath.startsWith('/storage/') ? cleanPath : `/storage${cleanPath}`;
        };

        const contentUrl = getStorageUrl(material.content);

        if (material.content_type === 'video') {
            return (
                <div className="space-y-4">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-border bg-black">
                        <video
                            controls
                            preload="metadata"
                            onEnded={handleMarkComplete}
                            className="h-full w-full object-contain"
                        >
                            <source src={contentUrl} type="video/mp4" />
                            Browser Anda tidak mendukung pemutaran video.
                        </video>
                    </div>
                </div>
            );
        }

        return (
            <PdfViewerClient
                contentUrl={contentUrl}
                isCompletedState={isCompletedState}
                onComplete={handleMarkComplete}
            />
        );
    };

    return (
        <>
            <Head title={`${material.title} - Siswa`} />

            <div className="flex flex-col gap-6 p-6">
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-6 !flex-col !py-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/student/subjects/${subject.id}`}>
                                            <ArrowLeft className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-primary/10 text-primary font-mono text-[10px]">
                                                {subject.code}
                                            </Badge>
                                            <Badge variant="outline" className="capitalize text-[10px]">
                                                {material.content_type}
                                            </Badge>

                                            {/* Badge Selesai di samping kategori */}
                                            {isCompletedState && (
                                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] gap-1 px-2 py-0.5">
                                                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                                                    <span>Selesai</span>
                                                </Badge>
                                            )}
                                        </div>
                                        <h1 className="text-2xl font-bold tracking-tight">
                                            {material.title}
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {material.description && (
                                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-muted/80 dark:bg-zinc-900/90 text-foreground shadow-sm space-y-1">
                                    <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                                        <Info className="h-3.5 w-3.5" />
                                        <span>Deskripsi & Petunjuk:</span>
                                    </p>
                                    <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                                        {material.description}
                                    </p>
                                </div>
                            )}

                            {renderContentBody()}
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card className="p-4 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-lg backdrop-blur-sm space-y-3 !flex-col !py-4">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span>Materi Lainnya</span>
                            </h3>

                            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                                {all_materials.map((item) => {
                                    const isCurrent = item.id === material.id;
                                    const isCompleted = isCurrent ? isCompletedState : item.is_completed;

                                    return (
                                        <Link key={item.id} href={`/student/materials/${item.id}`}>
                                            <div
                                                className={cn(
                                                    'p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 cursor-pointer',
                                                    isCurrent
                                                        ? 'bg-primary/10 border-primary/40 font-bold text-primary'
                                                        : 'border-border/60 hover:bg-accent/50 text-foreground'
                                                )}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {/* Icon Centang jika materi selesai */}
                                                    {isCompleted && (
                                                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                                    )}
                                                    <span className="truncate">{item.title}</span>
                                                </div>
                                                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
