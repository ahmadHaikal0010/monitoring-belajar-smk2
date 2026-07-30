import { Head, Link } from '@inertiajs/react';
import { Info, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import CleanLayout from '@/layouts/auth/clean-layout';

export default function Register() {
    return (
        <div className="space-y-6">
            <Head title="Pendaftaran Akun" />

            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Pendaftaran Akun Web
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Monitoring Belajar SMK Negeri 2 Lubuk Basung
                    </p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
                    <Info className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="space-y-1">
                        <strong className="font-semibold block text-sm">Pendaftaran Web Dinonaktifkan</strong>
                        <p className="leading-relaxed">
                            Pendaftaran akun siswa dilakukan secara mandiri melalui <span className="font-bold underline">Aplikasi Mobile</span>. Untuk pengguna Guru/Administrator, akun diberikan langsung oleh pihak sekolah.
                        </p>
                    </div>
                </div>

                <Button asChild className="w-full h-10 rounded-xl bg-zinc-900 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                    <Link href="/login" className="flex items-center justify-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Halaman Login</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}

Register.layout = (page: ReactNode) => <CleanLayout children={page} />;
