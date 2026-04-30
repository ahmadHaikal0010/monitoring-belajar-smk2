import { Head, Link } from '@inertiajs/react';
import {
    User,
    Briefcase,
    GraduationCap,
    Mail,
    Calendar,
    Settings2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { profile, edit } from '@/routes/teacher';

interface TeacherProfileProps {
    teacher: {
        id: string;
        nip: string;
        specialization: string;
        bio?: string;
        photo_url?: string;
        user: {
            name: string;
            email: string;
            created_at: string;
        };
    };
}

export default function TeacherProfile({
    teacher: teacherData,
}: TeacherProfileProps) {
    if (!teacherData) {
        return (
            <>
                <Head title="Data Diri" />
                <div className="flex min-h-[50vh] items-center justify-center">
                    <p className="text-muted-foreground italic">
                        Memuat data profil...
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Data Diri" />

            <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Data Diri
                        </h1>
                        <p className="text-muted-foreground">
                            Informasi profil lengkap Anda sebagai guru
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="w-fit border-zinc-200 bg-background/50 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                    >
                        <Link href={edit.url()}>
                            <Settings2 className="mr-2 h-4 w-4" />
                            Ubah Profil
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Card Profil Utama */}
                    <Card className="h-fit border-none bg-card/50 shadow-md backdrop-blur-sm lg:col-span-1">
                        <CardHeader className="flex flex-col items-center pt-10 pb-8">
                            <Avatar className="mb-4 h-32 w-32 border-4 border-background shadow-xl">
                                <AvatarImage
                                    src={teacherData.photo_url}
                                    alt={teacherData.user?.name}
                                />
                                <AvatarFallback className="bg-primary/10 text-2xl text-primary uppercase">
                                    {teacherData.user?.name?.charAt(0) || 'G'}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-center text-xl font-bold">
                                {teacherData.user?.name}
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className="mt-2 px-4 py-1"
                            >
                                Guru
                            </Badge>
                        </CardHeader>
                        <CardContent className="space-y-4 border-t pt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {teacherData.user?.email}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Terdaftar sejak:{' '}
                                </span>
                                <span className="text-foreground">
                                    {teacherData.user?.created_at
                                        ? new Date(
                                              teacherData.user.created_at,
                                          ).toLocaleDateString('id-ID', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                          })
                                        : '-'}
                                </span>
                            </div>

                            {teacherData.bio && (
                                <div className="mt-6 border-t pt-6">
                                    <div className="mb-3 text-center text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                        Bio Singkat
                                    </div>
                                    <p className="px-2 text-center text-sm leading-relaxed text-muted-foreground italic">
                                        "{teacherData.bio}"
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card Detail Data Diri */}
                    <Card className="border-none bg-card/50 shadow-md backdrop-blur-sm lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Detail Informasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Briefcase className="h-4 w-4" />
                                        NIP (Nomor Induk Pegawai)
                                    </div>
                                    <div className="rounded-lg border bg-muted/30 p-3 text-lg font-semibold tracking-wider">
                                        {teacherData.nip}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <GraduationCap className="h-4 w-4" />
                                        Bidang Keahlian / Spesialisasi
                                    </div>
                                    <div className="rounded-lg border bg-muted/30 p-3 text-lg font-semibold">
                                        {teacherData.specialization ||
                                            'Belum diisi'}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 text-sm">
                                <div className="mb-1 flex items-center gap-2 font-bold text-primary">
                                    <User className="h-4 w-4" />
                                    Informasi Akun
                                </div>
                                <p className="leading-relaxed text-muted-foreground">
                                    Data ini digunakan untuk keperluan
                                    administrasi sekolah dan monitoring
                                    pembelajaran. Jika terdapat kesalahan data,
                                    silakan hubungi operator sekolah.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

TeacherProfile.layout = {
    breadcrumbs: [
        {
            title: 'Data Diri',
            href: profile(),
        },
    ],
};
