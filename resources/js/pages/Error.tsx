import { Head, Link } from '@inertiajs/react';
import { 
    AlertTriangle, 
    Home, 
    ShieldAlert, 
    FileQuestion, 
    ServerCrash, 
    ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
    status: number;
}

export default function ErrorPage({ status }: Props) {
    const title = {
        503: '503: Layanan Tidak Tersedia',
        500: '500: Terjadi Kesalahan Server',
        404: '404: Halaman Tidak Ditemukan',
        403: '403: Akses Dibatasi',
    }[status] || 'Terjadi Kesalahan';

    const description = {
        503: 'Maaf, sistem kami sedang dalam pemeliharaan rutin. Silakan coba beberapa saat lagi.',
        500: 'Oops! Terjadi kendala teknis pada server kami. Tim kami sedang berusaha memperbaikinya.',
        404: 'Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.',
        403: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.',
    }[status] || 'Terjadi kesalahan yang tidak terduga dalam sistem.';

    const Icon = {
        503: ServerCrash,
        500: ServerCrash,
        404: FileQuestion,
        403: ShieldAlert,
    }[status] || AlertTriangle;

    return (
        <>
            <Head title={title} />
            
            <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950">
                <Card className="max-w-md w-full border-none shadow-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-8 text-center flex flex-col items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner">
                        <Icon className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {title}
                        </h1>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="flex flex-col w-full gap-3 mt-2">
                        <Button className="w-full gap-2 shadow-lg shadow-primary/20" asChild>
                            <Link href="/dashboard">
                                <Home className="h-4 w-4" />
                                Kembali ke Beranda
                            </Link>
                        </Button>
                        
                        <Button variant="ghost" className="w-full gap-2" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Halaman Sebelumnya
                        </Button>
                    </div>

                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-4 opacity-50">
                        Sistem Monitoring Belajar SMK
                    </p>
                </Card>
            </div>
        </>
    );
}
