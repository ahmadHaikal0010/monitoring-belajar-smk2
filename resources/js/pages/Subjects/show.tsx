import { Head, Link, setLayoutProps, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    Clock,
    Pencil,
    FileText,
    Shield,
    Mail
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Subject {
    id: string;
    teacher_id: string;
    title: string;
    description: string;
    teacher_name: string;
    teacher_email: string;
    created_at: string;
}

interface Props {
    subject: Subject;
}

export default function ShowSubject({ subject }: Props) {
    const { auth } = usePage().props as any;

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Mata Pelajaran',
                href: '/teacher/subjects',
            },
            {
                title: 'Detail Mapel',
                href: `/teacher/subjects/${subject.id}`,
            },
        ],
    });

    return (
        <>
            <Head title={`Detail Mapel: ${subject.title}`} />

            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shrink-0"
                        >
                            <Link href="/teacher/subjects">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Detail Mata Pelajaran
                            </h1>
                            <p className="text-muted-foreground">
                                Informasi lengkap mengenai materi dan pengampu
                                mata pelajaran.
                            </p>
                        </div>
                    </div>

                    {(auth.user.role === 'admin' ||
                        (auth.user.role === 'guru' &&
                            auth.user.id === subject.teacher_id)) && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" className="gap-2" asChild>
                                <Link href={`/teacher/subjects/${subject.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-primary/5 pb-8 pt-8 px-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <Badge variant="secondary" className="font-semibold uppercase tracking-wider text-[10px]">
                                        Mata Pelajaran
                                    </Badge>
                                </div>
                                <CardTitle className="text-3xl font-bold leading-tight">
                                    {subject.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                        <FileText className="h-4 w-4" />
                                        Deskripsi Materi
                                    </div>
                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-wrap">
                                            {subject.description || 'Tidak ada deskripsi yang tersedia untuk mata pelajaran ini.'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Teacher Info */}
                        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                    Pengajar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {subject.teacher_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-sm truncate">
                                            {subject.teacher_name}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Shield className="h-3 w-3 text-primary/70" />
                                            Guru Pengampu
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Email</span>
                                            <span className="text-xs truncate">{subject.teacher_email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Dibuat Pada</span>
                                            <span className="text-xs">
                                                {new Date(subject.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Waktu</span>
                                            <span className="text-xs">
                                                {new Date(subject.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })} WIB
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional Stats/Info if needed */}
                        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Hak Akses
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Hanya guru pengampu yang bersangkutan yang memiliki wewenang penuh untuk memperbarui atau menghapus data mata pelajaran ini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
