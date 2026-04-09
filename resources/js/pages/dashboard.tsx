import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    UserCheck, 
    BookOpen, 
    FileText, 
    ArrowUpRight, 
    ArrowDownRight,
    Clock
} from 'lucide-react';
import { dashboard } from '@/routes';

export default function Dashboard() {
    // Data Dummy untuk Preview
    const stats = [
        { title: 'Total Siswa', value: '482', icon: Users, trend: '+12', trendUp: true },
        { title: 'Total Guru', value: '36', icon: UserCheck, trend: '+2', trendUp: true },
        { title: 'Mata Pelajaran', value: '24', icon: BookOpen, trend: '+2', trendUp: true },
        { title: 'Total Materi', value: '156', icon: FileText, trend: '+8', trendUp: true },
    ];

    const akunPending = [
        { name: 'Ahmad Fauzi', email: 'ahmad@example.com', role: 'Siswa', date: '2 jam yang lalu' },
        { name: 'Siti Nurhaliza', email: 'siti@example.com', role: 'Siswa', date: '5 jam yang lalu' },
        { name: 'Budi Santoso', email: 'budi@example.com', role: 'Guru', date: '1 hari yang lalu' },
        { name: 'Dewi Lestari', email: 'dewi@example.com', role: 'Siswa', date: '2 hari yang lalu' },
        { name: 'Rizki Pratama', email: 'rizki@example.com', role: 'Siswa', date: '2 hari yang lalu' },
    ];

    const penyelesaianMapel = [
        { name: 'Pemrograman Web', count: 82, total: 120 },
        { name: 'Basis Data', count: 76, total: 115 },
        { name: 'Jaringan Komputer', count: 79, total: 98 },
        { name: 'Desain Grafis', count: 85, total: 87 },
    ];

    return (
        <>
            <Head title="Dashboard" />
            
            <div className="flex flex-col gap-8 p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Ringkasan data pembelajaran siswa terkini</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <stat.icon className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="flex items-center mt-1 text-xs">
                                    {stat.trendUp ? (
                                        <span className="flex items-center text-green-600 font-medium">
                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                            {stat.trend}
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600 font-medium">
                                            <ArrowDownRight className="w-3 h-3 mr-1" />
                                            {stat.trend}
                                        </span>
                                    )}
                                    <span className="ml-1 text-muted-foreground">dari bulan lalu</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-7">
                    <Card className="md:col-span-4 border-none shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Akun Baru</CardTitle>
                            <Link href="#" className="text-xs font-medium text-primary hover:underline">Lihat Semua</Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Nama</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Waktu</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {akunPending.map((user, i) => (
                                            <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant="secondary" className="font-normal rounded-md bg-zinc-100 text-zinc-700">
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {user.date}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">
                                                        Setujui
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-3 border-none shadow-md bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <CardTitle className="text-lg">Penyelesaian Mata Pelajaran</CardTitle>
                            <div className="p-2 bg-muted rounded-lg">
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {penyelesaianMapel.map((mapel, i) => {
                                    const percentage = Math.round((mapel.count / mapel.total) * 100);
                                    return (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-semibold">{mapel.name}</span>
                                                <span className="font-bold text-primary">{mapel.count} Siswa</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                    className="h-full bg-primary rounded-full"
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                                <span>{percentage}% Selesai</span>
                                                <span>Total {mapel.total} Siswa</span>
                                            </div>
                                        </div>
                                    );
                                })}
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
