import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Pencil, 
    Mail, 
    Shield, 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    User as UserIcon,
    Clock
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import admin from '@/routes/admin';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'guru' | 'siswa';
    is_approved: boolean;
    created_at: string;
}

interface Props {
    user: User;
}

const RoleBadge = ({ role }: { role: User['role'] }) => {
    switch (role) {
        case 'admin':
            return (
                <Badge className="bg-rose-500 hover:bg-rose-600">
                    <Shield className="mr-1 h-3 w-3" />
                    Administrator
                </Badge>
            );
        case 'guru':
            return (
                <Badge className="bg-blue-500 hover:bg-blue-600">
                    <UserIcon className="mr-1 h-3 w-3" />
                    Guru
                </Badge>
            );
        case 'siswa':
            return (
                <Badge className="bg-emerald-500 hover:bg-emerald-600">
                    <UserIcon className="mr-1 h-3 w-3" />
                    Siswa
                </Badge>
            );
        default:
            return <Badge variant="outline">{role}</Badge>;
    }
};

export default function ShowUser({ user }: Props) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Manajemen User',
                href: admin.users?.index?.url ? admin.users.index.url() : '/admin/users',
            },
            {
                title: 'Detail User',
                href: admin.users?.show?.url ? admin.users.show.url(user.id.toString()) : `/admin/users/${user.id}`,
            },
        ],
    });

    return (
        <>
            <Head title={`Detail User: ${user.name}`} />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="shrink-0">
                            <Link href={admin.users?.index?.url ? admin.users.index.url() : '/admin/users'}>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
                            <p className="text-muted-foreground">Informasi mendetail mengenai akun pengguna.</p>
                        </div>
                    </div>
                    <Button className="gap-2 shadow-lg shadow-primary/20" asChild>
                        <Link href={admin.users?.edit?.url ? admin.users.edit.url(user.id.toString()) : `/admin/users/${user.id}/edit`}>
                            <Pencil className="w-4 h-4" />
                            Edit Profil
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6">
                    {/* Header Card */}
                    <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                <AvatarFallback className="bg-primary/10 text-4xl font-bold text-primary">
                                    {user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-bold">{user.name}</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        <RoleBadge role={user.role} />
                                        {user.is_approved ? (
                                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                                Terverifikasi
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/20">
                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                Menunggu Persetujuan
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 w-full max-w-md pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>Terdaftar: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span>Waktu: {new Date(user.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Account Security Card */}
                    <Card className="p-6 border-none shadow-lg bg-card/50 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Keamanan Akun
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status Akses</p>
                                <p className="text-sm">
                                    {user.is_approved 
                                        ? "Pengguna memiliki akses penuh ke sistem sesuai dengan peran yang diberikan." 
                                        : "Akses pengguna sedang ditangguhkan atau memerlukan persetujuan administrator."}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Peran Sistem</p>
                                <p className="text-sm">
                                    {user.role === 'admin' && "Administrator memiliki wewenang penuh untuk mengelola pengguna dan sistem."}
                                    {user.role === 'guru' && "Guru dapat mengelola materi pembelajaran, tugas, dan nilai siswa."}
                                    {user.role === 'siswa' && "Siswa dapat mengakses materi pembelajaran dan mengerjakan tugas."}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
