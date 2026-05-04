import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    GraduationCap,
    Image as ImageIcon,
    AlertCircle,
    FileText,
    ArrowLeft,
    Settings2,
    CheckCircle2,
    X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update, profile } from '@/routes/teacher';

interface Teacher {
    id: string;
    nip: string;
    specialization: string;
    bio: string;
    photo_url?: string;
}

interface EditTeacherProps {
    teacher: Teacher;
}

export default function EditTeacher({ teacher }: EditTeacherProps) {
    const { flash } = usePage().props as any;
    const [showFlash, setShowFlash] = useState(false);

    const { data, setData, post, processing, errors, hasErrors } = useForm({
        nip: teacher?.nip || '',
        specialization: teacher?.specialization || '',
        bio: teacher?.bio || '',
        photo: null as File | null,
    });

    useEffect(() => {
        if (flash?.success || flash?.error) {
            const showTimer = setTimeout(() => setShowFlash(true), 0);
            const hideTimer = setTimeout(() => setShowFlash(false), 5000);

            return () => {
                clearTimeout(showTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [flash?.success, flash?.error]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!teacher) {
            return;
        }

        post(update.url(teacher.id), {
            forceFormData: true,
        });
    };

    if (!teacher) {
        return (
            <div className="flex min-h-screen items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-bold">Profil Tidak Ditemukan</h2>
                    <p className="text-muted-foreground">
                        Sistem tidak dapat menemukan data profil guru Anda.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard">Kembali ke Dashboard</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
            <Head title="Ubah Profil Guru" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <AnimatePresence>
                    {showFlash && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="mb-4 overflow-hidden"
                        >
                            <div
                                className={`flex items-start gap-3 rounded-xl border p-4 shadow-sm dark:bg-opacity-10 ${
                                    flash.success
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                                        : 'border-destructive/20 bg-destructive/10 text-destructive'
                                }`}
                            >
                                {flash.success ? (
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowFlash(false)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mb-6 flex items-center justify-between">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="p-0 text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
                    >
                        <Link
                            href={profile.url()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Profil
                        </Link>
                    </Button>
                </div>

                {hasErrors && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400"
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>
                            Ada beberapa data yang kurang tepat. Silakan periksa
                            kolom yang berwarna merah.
                        </span>
                    </motion.div>
                )}

                <Card className="border-none bg-card/70 shadow-2xl backdrop-blur-xl">
                    <CardHeader className="space-y-2 rounded-t-xl border-b bg-muted/30 pb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-primary/10 shadow-inner transition-transform duration-300 hover:rotate-0">
                            <Settings2 className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">
                            Ubah Profil
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                            Perbarui informasi profil guru Anda di bawah ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 text-left">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="group space-y-2">
                                <Label
                                    htmlFor="nip"
                                    className="ml-1 flex items-center gap-2 text-sm font-semibold text-muted-foreground"
                                >
                                    <Briefcase className="h-4 w-4" />
                                    NIP (Nomor Induk Pegawai)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="nip"
                                        name="nip"
                                        value={data.nip}
                                        disabled
                                        className="h-12 cursor-not-allowed rounded-xl border-zinc-200 bg-zinc-100 opacity-70 dark:border-zinc-800 dark:bg-zinc-800/50"
                                    />
                                </div>
                                <p className="mt-1 ml-1 text-[10px] font-medium text-muted-foreground italic">
                                    NIP tidak dapat diubah. Hubungi admin jika
                                    terdapat kesalahan.
                                </p>
                            </div>

                            <div className="group space-y-2">
                                <Label
                                    htmlFor="specialization"
                                    className="ml-1 flex items-center gap-2 text-sm font-semibold transition-colors group-focus-within:text-primary"
                                >
                                    <GraduationCap className="h-4 w-4" />
                                    Bidang Keahlian / Spesialisasi
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="specialization"
                                        name="specialization"
                                        value={data.specialization}
                                        onChange={(e) =>
                                            setData(
                                                'specialization',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Contoh: Rekayasa Perangkat Lunak"
                                        className="h-12 rounded-xl border-zinc-200 bg-white/50 transition-all duration-200 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900/50"
                                        required
                                    />
                                </div>
                                <InputError message={errors.specialization} />
                            </div>

                            <div className="group space-y-2">
                                <Label
                                    htmlFor="bio"
                                    className="ml-1 flex items-center gap-2 text-sm font-semibold transition-colors group-focus-within:text-primary"
                                >
                                    <FileText className="h-4 w-4" />
                                    Bio Singkat (Opsional)
                                </Label>
                                <div className="relative">
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={data.bio}
                                        onChange={(e) =>
                                            setData('bio', e.target.value)
                                        }
                                        placeholder="Ceritakan sedikit tentang pengalaman atau profil mengajar Anda..."
                                        className="min-h-[100px] w-full resize-none rounded-xl border border-zinc-200 bg-white/50 p-3 text-sm transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900/50"
                                        maxLength={255}
                                    />
                                    <div className="absolute right-2 bottom-2 text-[10px] font-medium text-muted-foreground">
                                        {data.bio.length}/255
                                    </div>
                                </div>
                                <InputError message={errors.bio} />
                            </div>

                            <div className="group space-y-2">
                                <Label
                                    htmlFor="photo"
                                    className="ml-1 flex items-center gap-2 text-sm font-semibold transition-colors group-focus-within:text-primary"
                                >
                                    <ImageIcon className="h-4 w-4" />
                                    Foto Profil Baru (Opsional)
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setData(
                                                'photo',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="h-12 cursor-pointer rounded-xl border-zinc-200 bg-white/50 pt-2.5 transition-all duration-200 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-1 file:text-xs file:font-bold file:text-primary hover:file:bg-primary/20 focus:ring-4 focus:ring-primary/10 dark:border-zinc-800 dark:bg-zinc-900/50"
                                    />
                                </div>
                                <p className="mt-1 ml-1 text-[10px] font-medium text-muted-foreground italic">
                                    Biarkan kosong jika tidak ingin mengubah
                                    foto. Format: JPG, PNG, WEBP (Maks: 2MB).
                                </p>
                                <InputError message={errors.photo} />
                            </div>

                            <div className="pt-6">
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Button
                                        type="submit"
                                        className="group h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all duration-300 hover:bg-primary/90"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-5 w-5 animate-spin" />
                                        ) : (
                                            <span className="flex items-center">
                                                Simpan Perubahan
                                                <motion.span
                                                    className="ml-2"
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.5,
                                                    }}
                                                >
                                                    →
                                                </motion.span>
                                            </span>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
