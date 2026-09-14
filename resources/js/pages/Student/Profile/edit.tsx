import { Head, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Camera,
    Save,
    Check,
    X,
    School,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Classroom {
    id: string;
    name: string;
    grade: string;
    major_name?: string;
    major_code?: string;
}

interface Student {
    id: string;
    nisn: string;
    address?: string;
    photo?: string | null;
    name: string;
    email: string;
    classroom?: Classroom | null;
}

interface Props {
    student: Student;
}

export default function StudentProfileEdit({ student }: Props) {
    const { flash } = usePage().props as any;
    const [dismissedFlash, setDismissedFlash] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(student.photo || null);

    const flashMessage = flash?.success || flash?.error;
    const showSuccess = Boolean(flashMessage && dismissedFlash !== flashMessage);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => {
                setDismissedFlash(flashMessage);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const { data, setData, post, processing, errors } = useForm({
        name: student.name || '',
        nisn: student.nisn || '',
        address: student.address || '',
        photo: null as File | null,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/student/profile/update', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setData('photo', null);
            },
        });
    };

    return (
        <>
            <Head title="Profil Saya - Siswa" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                {/* Flash Alert Banner */}
                <AnimatePresence>
                    {showSuccess && (flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className={cn(
                                "mb-2 flex items-start gap-3 rounded-xl border p-4 shadow-sm backdrop-blur-sm",
                                flash?.success
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
                                    : "border-destructive/20 bg-destructive/10 text-destructive"
                            )}>
                                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {flash.success || flash.error}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setDismissedFlash(flashMessage)}
                                    className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Profile Header Card */}
                <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar Picker */}
                        <div className="relative group">
                            <div className="h-28 w-28 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shadow-md">
                                {photoPreview ? (
                                    <img src={photoPreview} alt={student.name} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <label className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold gap-1 backdrop-blur-xs">
                                <Camera className="h-5 w-5" />
                                <span>Ubah Foto</span>
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>

                        {/* Title & Badges */}
                        <div className="space-y-2 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <Badge className="bg-primary/10 text-primary font-mono text-[11px]">
                                    NISN: {student.nisn || '-'}
                                </Badge>
                                {student.classroom && (
                                    <Badge variant="outline" className="text-[11px] gap-1">
                                        <School className="h-3 w-3" />
                                        <span>{student.classroom.name} ({student.classroom.major_code})</span>
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{student.name}</h1>
                            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{student.email}</span>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Edit Form */}
                <Card className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-card/60 shadow-xl backdrop-blur-sm space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
                        <User className="h-5 w-5 text-primary" />
                        <span>Informasi Data Diri Siswa</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">Nama Lengkap:</Label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="text-xs h-9"
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold">NISN (Nomor Induk Siswa Nasional):</Label>
                                <Input
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    className="text-xs h-9 font-mono bg-muted text-muted-foreground cursor-not-allowed"
                                    readOnly
                                />
                                {errors.nisn && <p className="text-xs text-destructive">{errors.nisn}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Email (Terdaftar Auth):</Label>
                            <Input
                                value={student.email}
                                disabled
                                className="text-xs h-9 bg-muted text-muted-foreground"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Alamat Tempat Tinggal:</Label>
                            <Textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={3}
                                className="text-xs"
                                placeholder="Masukkan alamat domisili lengkap..."
                            />
                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-md text-xs h-9"
                            >
                                <Save className="h-4 w-4" />
                                <span>Simpan Perubahan Profil</span>
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </>
    );
}
