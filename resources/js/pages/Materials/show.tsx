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
    Eye,
    Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Material {
    id: string;
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
        document:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        url: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    const labels = {
        video: 'Video Pembelajaran',
        document: 'Dokumen / Modul',
        url: 'Tautan / Embed',
    };

    return (
        <Badge
            variant="outline"
            className={cn('border-none font-semibold', colors[type])}
        >
            {labels[type]}
        </Badge>
    );
};

export default function ShowMaterial({ material }: Props) {
    const { auth } = usePage().props as any;

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Materi Pembelajaran',
                href: '/teacher/materials',
            },
            {
                title: 'Detail Materi',
                href: `/teacher/materials/${material.id}`,
            },
        ],
    });

    const isIframe = material.content_body.trim().startsWith('<iframe');
    const isPdf = material.content_body.toLowerCase().endsWith('.pdf');

    return (
        <>
            <Head title={`Detail Materi: ${material.title}`} />

            <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shrink-0"
                        >
                            <Link href={`/teacher/materials?subject_id=${material.subject_id}`}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Detail Materi
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Pengelolaan materi pembelajaran untuk para pengajar.
                            </p>
                        </div>
                    </div>

                    {auth.user.role === 'guru' && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="gap-2" asChild>
                                <Link
                                    href={`/teacher/materials/${material.id}/edit`}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit Materi
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Content Preview/Player Card */}
                        <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                            <div className={cn(
                                "flex w-full items-center justify-center border-b border-zinc-200 bg-muted dark:border-zinc-800 overflow-hidden",
                                (material.content_type === 'video' || isIframe || (material.content_type === 'document' && isPdf)) ? "aspect-[4/3] sm:aspect-video" : "min-h-[300px]"
                            )}>
                                {material.content_type === 'video' ? (
                                    <video
                                        src={`/storage/${material.content_body}`}
                                        className="h-full w-full object-contain"
                                        controls
                                        controlsList="nodownload"
                                    />
                                ) : material.content_type === 'document' ? (
                                    <div className="flex flex-col items-center gap-4 w-full h-full">
                                        {isPdf ? (
                                            <iframe
                                                src={`/storage/${material.content_body}#toolbar=0`}
                                                className="w-full h-full border-none"
                                                title={material.title}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center h-full">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                    <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">Berkas Dokumen Tersedia</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Dokumen ini dapat Anda lihat atau unduh untuk dipelajari.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                                                    <Button variant="outline" className="gap-2" asChild>
                                                        <a href={`/storage/${material.content_body}`} target="_blank" rel="noopener noreferrer">
                                                            <Eye className="h-4 w-4" />
                                                            Lihat Dokumen
                                                        </a>
                                                    </Button>
                                                    <Button className="gap-2" asChild>
                                                        <a href={`/storage/${material.content_body}`} download={material.title}>
                                                            <Download className="h-4 w-4" />
                                                            Unduh Dokumen
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Tautan / Iframe Mode */
                                    <div className="w-full h-full">
                                        {isIframe ? (
                                            <div 
                                                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                                dangerouslySetInnerHTML={{ __html: material.content_body }} 
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4 p-12 text-center h-full justify-center">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                    <LinkIcon className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">Tautan Eksternal</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Akses sumber referensi materi melalui tautan eksternal.
                                                    </p>
                                                </div>
                                                <Button
                                                    className="gap-2"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <a
                                                        href={material.content_body}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        Buka Tautan
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Document Actions Bar (Only for PDFs or as additional footer) */}
                            {material.content_type === 'document' && isPdf && (
                                <div className="flex items-center justify-between px-8 py-4 bg-muted/30 border-b border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                                            Pratinjau: {material.title}.pdf
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-2" asChild>
                                            <a href={`/storage/${material.content_body}`} target="_blank" rel="noopener noreferrer">
                                                <Eye className="h-3.5 w-3.5" />
                                                Buka Full
                                            </a>
                                        </Button>
                                        <Button size="sm" className="h-8 text-xs gap-2" asChild>
                                            <a href={`/storage/${material.content_body}`} download={material.title}>
                                                <Download className="h-3.5 w-3.5" />
                                                Unduh
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <CardHeader className="p-8">
                                <div className="mb-4 flex flex-wrap items-center gap-3">
                                    <TypeBadge type={material.content_type} />
                                    <Badge
                                        variant="secondary"
                                        className="gap-1.5 py-1"
                                    >
                                        <BookOpen className="h-3 w-3" />
                                        {material.subject_title}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl font-bold leading-tight text-foreground">
                                    {material.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-8 pb-8">
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                        Deskripsi Materi
                                    </h4>
                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="whitespace-pre-wrap text-base italic leading-relaxed text-foreground/80">
                                            {material.description ||
                                                'Tidak ada deskripsi tambahan untuk materi ini.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info Area */}
                    <div className="space-y-6">
                        {/* Meta Info Card */}
                        <Card className="space-y-6 border-none bg-card/50 p-6 shadow-lg backdrop-blur-sm">
                            <div>
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Informasi Tambahan
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                                Tanggal Rilis
                                            </span>
                                            <span className="font-medium">
                                                {new Date(
                                                    material.created_at,
                                                ).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                                Waktu Unggah
                                            </span>
                                            <span className="font-medium">
                                                {new Date(
                                                    material.created_at,
                                                ).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}{' '}
                                                WIB
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
                                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    Mata Pelajaran
                                </h4>
                                <Link
                                    href={`/teacher/materials?subject_id=${material.id}`} // Sebaiknya ini subject_id jika ada relasi
                                    className="group flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-3 transition-colors hover:bg-primary/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                        <span className="max-w-[150px] truncate text-sm font-bold">
                                            {material.subject_title}
                                        </span>
                                    </div>
                                    <Eye className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                            </div>
                        </Card>

                        {/* Access Info Card */}
                        <div className="space-y-2 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-bold">
                                    Informasi Akses
                                </span>
                            </div>
                            <p className="text-xs leading-relaxed text-blue-700/80 dark:text-blue-300/80">
                                Materi ini tersedia secara otomatis di aplikasi mobile siswa yang terdaftar dalam mata pelajaran terkait.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
