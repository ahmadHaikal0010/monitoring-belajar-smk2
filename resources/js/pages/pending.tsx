import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout, home } from '@/routes';

export default function Pending() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
            <Head title="Akun Menunggu Persetujuan" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex max-w-md flex-col items-center gap-6"
            >
                <div className="rounded-full bg-yellow-500/10 p-6 text-yellow-500">
                    <Clock className="h-16 w-16" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Akun Sedang Ditinjau</h1>
                    <p className="text-muted-foreground">
                        Terima kasih telah mendaftar. Saat ini akun Anda sedang menunggu persetujuan dari administrator. 
                        Kami akan segera memberitahu Anda setelah akun diaktifkan.
                    </p>
                </div>

                <div className="flex flex-col w-full gap-3 sm:flex-row">
                    <Button asChild variant="outline" className="w-full">
                        <Link href={home()}>Kembali ke Beranda</Link>
                    </Button>
                    <Button asChild variant="destructive" className="w-full">
                        <Link href={logout()} method="post">
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar
                        </Link>
                    </Button>
                </div>
                
                <p className="text-sm text-muted-foreground pt-4">
                    Butuh bantuan? Hubungi admin sekolah di <span className="font-medium text-foreground">admin@smk2.sch.id</span>
                </p>
            </motion.div>
        </div>
    );
}
