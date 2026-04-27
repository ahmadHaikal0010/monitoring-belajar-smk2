import { Head, Link } from '@inertiajs/react';
import { User, Briefcase, GraduationCap, Mail, Calendar, Settings2 } from 'lucide-react';
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

export default function TeacherProfile({ teacher: teacherData }: TeacherProfileProps) {
    if (!teacherData) {
        return (
            <>
                <Head title="Data Diri" />
                <div className="flex items-center justify-center min-h-[50vh]">
                    <p className="text-muted-foreground italic">Memuat data profil...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Data Diri" />

            <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Diri</h1>
                        <p className="text-muted-foreground">Informasi profil lengkap Anda sebagai guru</p>
                    </div>
                    <Button asChild variant="outline" className="w-fit shadow-sm bg-background/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200">
                        <Link href={edit.url()}>
                            <Settings2 className="w-4 h-4 mr-2" />
                            Ubah Profil
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Card Profil Utama */}
                    <Card className="lg:col-span-1 border-none shadow-md bg-card/50 backdrop-blur-sm h-fit">
                        <CardHeader className="flex flex-col items-center pb-8 pt-10">
                            <Avatar className="w-32 h-32 border-4 border-background shadow-xl mb-4">
                                <AvatarImage src={teacherData.photo_url} alt={teacherData.user?.name} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary uppercase">
                                    {teacherData.user?.name?.charAt(0) || 'G'}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl font-bold text-center">{teacherData.user?.name}</CardTitle>
                            <Badge variant="secondary" className="mt-2 px-4 py-1">Guru</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4 border-t pt-6">
                            <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {teacherData.user?.email}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Terdaftar sejak: </span>
                                <span className="text-foreground">
                                    {teacherData.user?.created_at ? new Date(teacherData.user.created_at).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : '-'}
                                </span>
                            </div>

                            {teacherData.bio && (
                                <div className="mt-6 pt-6 border-t">
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 text-center">Bio Singkat</div>
                                    <p className="text-sm text-center italic text-muted-foreground leading-relaxed px-2">
                                        "{teacherData.bio}"
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card Detail Data Diri */}
                    <Card className="lg:col-span-2 border-none shadow-md bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Detail Informasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Briefcase className="w-4 h-4" />
                                        NIP (Nomor Induk Pegawai)
                                    </div>
                                    <div className="text-lg font-semibold tracking-wider bg-muted/30 p-3 rounded-lg border">
                                        {teacherData.nip}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <GraduationCap className="w-4 h-4" />
                                        Bidang Keahlian / Spesialisasi
                                    </div>
                                    <div className="text-lg font-semibold bg-muted/30 p-3 rounded-lg border">
                                        {teacherData.specialization || 'Belum diisi'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm">
                                <div className="font-bold text-primary mb-1 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Informasi Akun
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    Data ini digunakan untuk keperluan administrasi sekolah dan monitoring pembelajaran.
                                    Jika terdapat kesalahan data, silakan hubungi operator sekolah.
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
