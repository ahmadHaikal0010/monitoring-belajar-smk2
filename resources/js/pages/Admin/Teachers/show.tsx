import { Head, Link, setLayoutProps } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    GraduationCap,
    Fingerprint,
    Mail,
    Calendar,
    Clock,
    UserCircle,
    Quote,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import admin from '@/routes/admin';

interface Teacher {
    id: string;
    user_id: number;
    nip: string;
    specialization: string;
    bio: string | null;
    photo: string | null;
    photo_url: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    teacher: Teacher;
}

export default function ShowTeacher({ teacher }: Props) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Daftar Guru',
                href: admin.teachers.index.url(),
            },
            {
                title: 'Detail Guru',
                href: admin.teachers.show.url(teacher.id),
            },
        ],
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return (
            new Date(dateString).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }) + ' WIB'
        );
    };

    return (
        <>
            <Head title={`Profil Guru - ${teacher.user.name}`} />

            <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
                {/* Header Actions */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shrink-0"
                        >
                            <Link href={admin.teachers.index.url()}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Detail Profil Guru
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Informasi lengkap mengenai profil profesional
                                pengajar.
                            </p>
                        </div>
                    </div>
                    <Button
                        className="gap-2 shadow-lg shadow-primary/20"
                        asChild
                    >
                        <Link href={admin.teachers.edit.url(teacher.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit Profil
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Profile Card */}
                    <div className="space-y-6 lg:col-span-1">
                        <Card className="overflow-hidden border-none bg-card/50 shadow-xl backdrop-blur-sm">
                            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
                            <div className="px-6 pb-6">
                                <div className="relative -mt-12 mb-4 flex justify-center lg:justify-start">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                        <AvatarImage
                                            src={teacher.photo_url || ''}
                                            alt={teacher.user.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
                                            {teacher.user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="space-y-1 text-center lg:text-left">
                                    <h2 className="text-xl font-bold text-foreground">
                                        {teacher.user.name}
                                    </h2>
                                    <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground lg:justify-start">
                                        <Mail className="h-3.5 w-3.5" />
                                        {teacher.user.email}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2 pt-2 lg:justify-start">
                                        <Badge
                                            variant="secondary"
                                            className="border-none bg-primary/10 text-[10px] font-bold text-primary"
                                        >
                                            GURU
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-zinc-200 text-[10px] font-medium dark:border-zinc-800"
                                        >
                                            NIP: {teacher.nip}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Separator className="bg-zinc-200 dark:bg-zinc-800" />
                            <div className="space-y-4 p-6">
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Statistik Akun
                                    </h3>
                                    <div className="grid gap-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="rounded-md bg-zinc-100 p-1.5 dark:bg-zinc-800">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] leading-none text-muted-foreground">
                                                    Terdaftar Pada
                                                </span>
                                                <span className="font-medium">
                                                    {formatDate(
                                                        teacher.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="rounded-md bg-zinc-100 p-1.5 dark:bg-zinc-800">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] leading-none text-muted-foreground">
                                                    Waktu Pendaftaran
                                                </span>
                                                <span className="font-medium">
                                                    {formatTime(
                                                        teacher.created_at,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="space-y-8 border-none bg-card/50 p-6 shadow-xl backdrop-blur-sm">
                            {/* Professional Info Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <GraduationCap className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold">
                                        Informasi Profesional
                                    </h3>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-1.5 rounded-xl border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-muted-foreground uppercase">
                                            <Fingerprint className="h-3 w-3" />
                                            Nomor Induk Pegawai
                                        </div>
                                        <p className="font-mono text-lg font-bold tracking-wider text-foreground">
                                            {teacher.nip}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5 rounded-xl border border-zinc-200/50 bg-muted/30 p-4 dark:border-zinc-800/50">
                                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-muted-foreground uppercase">
                                            <UserCircle className="h-3 w-3" />
                                            Bidang Spesialisasi
                                        </div>
                                        <p className="text-lg font-bold text-foreground">
                                            {teacher.specialization}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Bio Section */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Quote className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-bold">
                                        Bio & Keterangan
                                    </h3>
                                </div>
                                <div className="relative rounded-2xl border border-zinc-200/50 bg-muted/30 p-6 dark:border-zinc-800/50">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Quote className="h-12 w-12" />
                                    </div>
                                    <p className="text-base leading-relaxed text-foreground italic">
                                        {teacher.bio ||
                                            'Tidak ada informasi biografi yang tersedia untuk profil guru ini.'}
                                    </p>
                                </div>
                            </section>

                            {/* Footer/System Info */}
                            <div className="pt-4">
                                <div className="flex items-start gap-3 rounded-lg border border-orange-500/10 bg-orange-500/5 p-4">
                                    <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500" />
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Data profil ini merupakan informasi
                                        resmi yang digunakan dalam sistem
                                        monitoring sekolah. Pastikan data tetap
                                        akurat untuk memfasilitasi komunikasi
                                        dan administrasi yang tepat.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
