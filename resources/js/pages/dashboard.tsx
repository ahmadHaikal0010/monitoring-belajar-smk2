import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Users,
    UserCheck,
    BookOpen,
    FileText,
    Clock,
    UserPlus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

interface DashboardStats {
    total_students: number;
    total_teachers?: number;
    total_subjects: number;
    total_materials: number;
    total_enrollments?: number;
}

interface PendingUser {
    id: string;
    name: string;
    email: string;
    role: string;
    date: string;
}

interface RecentEnrollment {
    student_name: string;
    student_email: string;
    subject_title: string;
    date: string;
}

interface SubjectProgress {
    name: string;
    count: number;
    total: number;
    percentage?: number;
}

interface Props {
    stats: DashboardStats;
    pending_users?: PendingUser[];
    recent_enrollments?: RecentEnrollment[];
    subject_progress: SubjectProgress[];
}

export default function Dashboard({ stats, pending_users, recent_enrollments, subject_progress }: Props) {
    const { auth } = usePage().props as any;
    const isGuru = auth.user.role === 'guru';

    const statCards = [
        {
            title: 'Total Siswa',
            value: stats.total_students.toString(),
            icon: Users,
            description: isGuru ? 'Terdaftar di kelas Anda' : 'Siswa aktif terverifikasi',
        },
        {
            title: isGuru ? 'Mapel Anda' : 'Total Guru',
            value: (isGuru ? stats.total_subjects : stats.total_teachers)?.toString() || '0',
            icon: isGuru ? BookOpen : UserCheck,
            description: isGuru ? 'Mata pelajaran yang diampu' : 'Tenaga pendidik aktif',
        },
        {
            title: isGuru ? 'Pendaftaran' : 'Total Mapel',
            value: (isGuru ? stats.total_enrollments : stats.total_subjects)?.toString() || '0',
            icon: isGuru ? UserPlus : BookOpen,
            description: isGuru ? 'Total pendaftaran di semua kelas' : 'Mata pelajaran tersedia',
        },
        {
            title: 'Total Materi',
            value: stats.total_materials.toString(),
            icon: FileText,
            description: 'Materi tayang di semua mapel',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Selamat Datang, {auth.user.name.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                        Berikut adalah ringkasan data pembelajaran hari ini.
                    </p>
                </div>

                {/* Main Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, i) => (
                        <Card
                            key={i}
                            className="overflow-hidden border-none bg-card/50 shadow-md backdrop-blur-sm transition-all hover:translate-y-[-2px] hover:shadow-xl"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className="rounded-xl bg-primary/10 p-2.5 text-primary shadow-sm">
                                    <stat.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tabular-nums">
                                    {stat.value}
                                </div>
                                <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-7">
                    {/* Left Section: Pending Users or Recent Activity */}
                    <Card className="overflow-hidden border-none bg-card/50 shadow-md backdrop-blur-sm md:col-span-4">
                        <CardHeader className="flex flex-row items-center justify-between bg-muted/20 px-6 py-4">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    {isGuru ? 'Pendaftaran Terbaru' : 'Permintaan Akun Baru'}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {isGuru ? 'Siswa yang baru saja masuk ke kelas Anda' : 'Pengguna yang menunggu persetujuan Admin'}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-bold" asChild>
                                <Link href={isGuru ? "/admin/enrollments" : "/admin/approval"}>
                                    Lihat Semua
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b bg-muted/50 dark:border-zinc-800">
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Identitas
                                            </th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                                                {isGuru ? 'Mata Pelajaran' : 'Role'}
                                            </th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                                                Waktu
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {isGuru ? (
                                            recent_enrollments?.map((enrollment, i) => (
                                                <tr key={i} className="transition-colors hover:bg-muted/30">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold">{enrollment.student_name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{enrollment.student_email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant="outline" className="font-bold text-[10px] uppercase">{enrollment.subject_title}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {new Date(enrollment.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            pending_users?.map((user, i) => (
                                                <tr key={i} className="transition-colors hover:bg-muted/30">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold">{user.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{user.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge className={cn(
                                                            "font-bold text-[10px] uppercase",
                                                            user.role === 'guru' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                                        )} variant="outline">
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {new Date(user.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {((isGuru ? recent_enrollments?.length : pending_users?.length) === 0) && (
                                            <tr>
                                                <td colSpan={3} className="py-12 text-center text-sm italic text-muted-foreground">
                                                    Belum ada aktivitas terbaru.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Section: Progress */}
                    <Card className="border-none bg-card/50 shadow-md backdrop-blur-sm md:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold">
                                    {isGuru ? 'Pencapaian Siswa' : 'Mapel Terpopuler'}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {isGuru ? 'Rata-rata progres siswa per kelas' : 'Mata pelajaran dengan pendaftaran terbanyak'}
                                </p>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shadow-sm">
                                <BookOpen className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {subject_progress.map((mapel, i) => {
                                    const percentage = mapel.percentage ?? Math.round((mapel.count / (mapel.total || 1)) * 100);

                                    return (
                                        <div key={i} className="group space-y-2.5">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold tracking-tight group-hover:text-primary transition-colors">
                                                    {mapel.name}
                                                </span>
                                                <span className="font-black text-primary tabular-nums">
                                                    {isGuru ? `${percentage}%` : `${mapel.count} Siswa`}
                                                </span>
                                            </div>
                                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{
                                                        width: `${percentage}%`,
                                                    }}
                                                    transition={{
                                                        duration: 1.2,
                                                        ease: "easeOut",
                                                        delay: 0.3 + i * 0.1,
                                                    }}
                                                    className="h-full rounded-full bg-primary shadow-sm"
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                                                <span>
                                                    {isGuru ? 'Progres Rata-rata' : 'Popularitas'}
                                                </span>
                                                <span>
                                                    {isGuru ? `${mapel.count}/${mapel.total} Target` : `DARI ${mapel.total} TOTAL SISWA`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {subject_progress.length === 0 && (
                                    <div className="py-12 text-center text-sm italic text-muted-foreground">
                                        Belum ada data progres tersedia.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
