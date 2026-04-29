import { Head, useForm, setLayoutProps, Link } from '@inertiajs/react';
import {
    User,
    ArrowLeft,
    Save,
    GraduationCap,
    Fingerprint,
    Loader2,
    Image as ImageIcon,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

interface Teacher {
    id: string;
    user_id: number;
    nip: string;
    specialization: string;
    bio: string | null;
    photo: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    teacher: Teacher;
}

export default function EditTeacher({ teacher }: Props) {
    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Daftar Guru',
                href: admin.teachers.index.url(),
            },
            {
                title: 'Edit Guru',
                href: admin.teachers.edit.url(teacher.id),
            },
        ],
    });

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nip: teacher.nip,
        specialization: teacher.specialization,
        bio: teacher.bio || '',
        photo: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Menggunakan post dengan _method: 'PUT' karena FormData (untuk upload file)
        // tidak mendukung metode PUT secara native di PHP/Laravel
        post(admin.teachers.update.url(teacher.id));
    };

    return (
        <>
            <Head title={`Edit Guru - ${teacher.user.name}`} />

            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="shrink-0"
                    >
                        <Link href={admin.teachers.index.url()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Profil Guru
                        </h1>
                        <p className="text-muted-foreground">
                            Perbarui informasi profesional untuk{' '}
                            {teacher.user.name}.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="border-none bg-card/50 p-6 shadow-xl backdrop-blur-sm">
                        <div className="grid gap-6">
                            {/* Read-only User Info */}
                            <div className="grid gap-2 rounded-lg border border-primary/10 bg-primary/5 p-4">
                                <Label className="text-xs font-bold tracking-wider text-primary uppercase">
                                    Informasi Akun
                                </Label>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-primary/10 p-2">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {teacher.user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {teacher.user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {/* NIP */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="nip"
                                        className="text-sm font-semibold"
                                    >
                                        NIP (18 Karakter)
                                    </Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="nip"
                                            placeholder="Contoh: 198001012005011001"
                                            className="h-11 border-zinc-200 bg-background/50 pl-9 dark:border-zinc-800"
                                            value={data.nip}
                                            onChange={(e) =>
                                                setData('nip', e.target.value)
                                            }
                                            maxLength={18}
                                        />
                                    </div>
                                    <InputError message={errors.nip} />
                                </div>

                                {/* Specialization */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="specialization"
                                        className="text-sm font-semibold"
                                    >
                                        Bidang Keahlian
                                    </Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="specialization"
                                            placeholder="Contoh: Teknik Komputer"
                                            className="h-11 border-zinc-200 bg-background/50 pl-9 dark:border-zinc-800"
                                            value={data.specialization}
                                            onChange={(e) =>
                                                setData(
                                                    'specialization',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <InputError
                                        message={errors.specialization}
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="bio"
                                    className="text-sm font-semibold"
                                >
                                    Bio Singkat
                                </Label>
                                <textarea
                                    id="bio"
                                    rows={3}
                                    placeholder="Ceritakan sedikit tentang latar belakang guru..."
                                    className="flex w-full rounded-md border border-zinc-200 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800"
                                    value={data.bio}
                                    onChange={(e) =>
                                        setData('bio', e.target.value)
                                    }
                                />
                                <InputError message={errors.bio} />
                            </div>

                            {/* Photo Upload */}
                            <div className="grid gap-4">
                                <Label
                                    htmlFor="photo"
                                    className="text-sm font-semibold"
                                >
                                    Foto Profil
                                </Label>
                                <div className="flex items-start gap-4">
                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-muted dark:border-zinc-800">
                                        {teacher.photo ? (
                                            <img
                                                src={`/storage/${teacher.photo}`}
                                                alt={teacher.user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid flex-1 gap-2">
                                        <Input
                                            id="photo"
                                            type="file"
                                            accept="image/*"
                                            className="h-11 border-zinc-200 bg-background/50 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20 dark:border-zinc-800"
                                            onChange={(e) =>
                                                setData(
                                                    'photo',
                                                    e.target.files
                                                        ? e.target.files[0]
                                                        : null,
                                                )
                                            }
                                        />
                                        <InputError message={errors.photo} />
                                        <p className="text-[11px] text-muted-foreground">
                                            Kosongkan jika tidak ingin mengubah
                                            foto. Format: JPG, PNG, WEBP. Maks:
                                            2MB.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href={admin.teachers.index.url()}>Batal</Link>
                        </Button>
                        <Button
                            className="gap-2 px-8 shadow-lg shadow-primary/20"
                            disabled={processing}
                        >
                            {processing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
