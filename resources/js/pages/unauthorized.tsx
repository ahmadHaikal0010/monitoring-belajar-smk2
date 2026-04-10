import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout, home } from '@/routes';

export default function Unauthorized() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
            <Head title="Akses Tidak Diizinkan" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex max-w-md flex-col items-center gap-6"
            >
                <div className="rounded-full bg-destructive/10 p-6 text-destructive">
                    <ShieldAlert className="h-16 w-16" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-destructive">Akses Ditolak</h1>
                    <p className="text-muted-foreground text-lg">
                        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Halaman ini hanya dapat diakses oleh Guru atau Administrator. Jika Anda merasa ini adalah kesalahan, silakan hubungi tim IT.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3 sm:flex-row">
                    <Button asChild variant="default" className="w-full">
                        <Link href={home()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href={logout()} method="post">
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
