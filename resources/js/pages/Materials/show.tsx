import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    FileText,
    Link as LinkIcon,
    Calendar,
    Clock,
    BookOpen,
    Pencil,
    ExternalLink,
    Download,
    Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Material {
    id: string;
    subject_id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    content_body: string;
    description: string;
    subject_title: string;
    created_at: string;
}

interface Props {
    material: Material;
}

const TypeBadge = ({ type }: { type: Material['content_type'] }) => {
    const colors = {
        video: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        url: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    const labels = {
        video: 'Video Pembelajaran',
        document: 'Dokumen / Modul',
        url: 'Tautan / Embed',
    };

    return (
        <Badge variant="outline" className={cn('border-none font-semibold text-[10px] uppercase tracking-wider', colors[type])}>
            {labels[type]}
        </Badge>
    );
};

export default function ShowMaterial({ material }: Props) {
    const { auth } = usePage().props as any;

    setLayoutProps({
        breadcrumbs: [
            { title: 'Materi Pembelajaran', href: '/teacher/materials' },
            { title: 'Detail Materi', href: `/teacher/materials/${material?.id}` },
        ],
    });

    const contentBody = material?.content_body || '';
    const isIframe = contentBody.trim().startsWith('<iframe');
    const isPdf = contentBody.toLowerCase().endsWith('.pdf');

    return (
        <>
            <Head title={`Materi: ${material?.title}`} />

            <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={`/teacher/materials?subject_id=${material?.subject_id}`}><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{material?.title}</h1>
                            <p className="text-muted-foreground text-sm">Mata Pelajaran: <span className="font-bold">{material?.subject_title}</span></p>
                        </div>
                    </div>

                    {auth?.user?.role === 'guru' && (
                        <Button variant="outline" className="gap-2 shadow-sm" asChild>
                            <Link href={`/teacher/materials/${material?.id}/edit`}><Pencil className="h-4 w-4" /> Edit Materi</Link>
                        </Button>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                            <div className={cn(
                                "flex w-full items-center justify-center border-b border-zinc-100 bg-muted dark:border-zinc-800",
                                (material?.content_type === 'video' || isIframe || isPdf) ? "aspect-video" : "min-h-[200px]"
                            )}>
                                {material?.content_type === 'video' ? (
                                    <video src={`/storage/${contentBody}`} className="h-full w-full object-contain" controls controlsList="nodownload" />
                                ) : (material?.content_type === 'document' && isPdf) ? (
                                    <iframe src={`/storage/${contentBody}#toolbar=0`} className="w-full h-full border-none" title={material?.title} />
                                ) : material?.content_type === 'url' && isIframe ? (
                                    <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: contentBody }} />
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"><LinkIcon className="h-8 w-8" /></div>
                                        <div>
                                            <h3 className="text-lg font-bold">Materi Siap Diakses</h3>
                                            <Button className="mt-4 gap-2" asChild>
                                                <a href={material?.content_type === 'url' ? contentBody : `/storage/${contentBody}`} target="_blank" rel="noopener noreferrer">
                                                    {material?.content_type === 'url' ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                                                    {material?.content_type === 'url' ? 'Buka Tautan' : 'Unduh Berkas'}
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest"><FileText className="h-3.5 w-3.5" /> Deskripsi</div>
                                    <p className="text-base leading-relaxed whitespace-pre-wrap">{material?.description || 'Tidak ada deskripsi.'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="border-none bg-card/50 shadow-lg backdrop-blur-sm p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Informasi Materi</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><BookOpen className="h-4 w-4" /></div>
                                    <div><p className="text-[10px] text-muted-foreground uppercase font-bold leading-none">Mata Pelajaran</p><p className="text-sm font-semibold">{material?.subject_title}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground"><Calendar className="h-4 w-4" /></div>
                                    <div><p className="text-[10px] text-muted-foreground uppercase font-bold leading-none">Diterbitkan</p><p className="text-sm font-semibold">{material?.created_at ? new Date(material.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-muted-foreground"><Clock className="h-4 w-4" /></div>
                                    <div><p className="text-[10px] text-muted-foreground uppercase font-bold leading-none">Waktu</p><p className="text-sm font-semibold">{material?.created_at ? new Date(material.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB</p></div>
                                </div>
                                <div className="pt-2"><TypeBadge type={material?.content_type} /></div>
                            </div>
                        </Card>

                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                            <h4 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-tight"><Shield className="h-3.5 w-3.5" /> Keamanan Materi</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">Materi ini hanya dapat diakses oleh siswa yang terdaftar secara sah pada mata pelajaran ini.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
