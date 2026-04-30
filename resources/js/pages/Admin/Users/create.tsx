import { Head, Link, useForm, setLayoutProps } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Save, 
    User, 
    Mail, 
    Lock, 
    Shield, 
    CheckCircle2, 
    AlertCircle,
    Loader2
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import admin from '@/routes/admin';

export default function CreateUser() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'siswa',
        is_approved: true,
    });

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Manajemen User',
                href: admin.users?.index?.url ? admin.users.index.url() : '/admin/users',
            },
            {
                title: 'Tambah User',
                href: admin.users?.create?.url ? admin.users.create.url() : '/admin/users/create',
            },
        ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = admin.users?.store?.url ? admin.users.store.url() : '/admin/users';
        post(url, {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Tambah User Baru" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="shrink-0">
                        <Link href={admin.users?.index?.url ? admin.users.index.url() : '/admin/users'}>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah User Baru</h1>
                        <p className="text-muted-foreground">Daftarkan pengguna baru ke dalam sistem monitoring belajar.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="p-6 border-none shadow-xl bg-card/50 backdrop-blur-sm">
                        <div className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Nama Lengkap */}
                                <div className="grid gap-2">
                                    <Label htmlFor="name" className="text-sm font-semibold">Nama Lengkap</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="name" 
                                            placeholder="Masukkan nama lengkap..." 
                                            className="pl-9 h-11 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">Alamat Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="email" 
                                            type="email"
                                            placeholder="nama@example.com" 
                                            className="pl-9 h-11 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-sm font-semibold">Kata Sandi</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="password" 
                                            type="password"
                                            placeholder="Minimal 8 karakter" 
                                            className="pl-9 h-11 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {/* Password Confirmation */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation" className="text-sm font-semibold">Konfirmasi Kata Sandi</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input 
                                            id="password_confirmation" 
                                            type="password"
                                            placeholder="Ulangi kata sandi" 
                                            className="pl-9 h-11 bg-background/50 border-zinc-200 dark:border-zinc-800"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 items-start">
                                {/* Role Selection */}
                                <div className="grid gap-2">
                                    <Label htmlFor="role" className="text-sm font-semibold">Peran Pengguna</Label>
                                    <Select 
                                        value={data.role} 
                                        onValueChange={(value) => setData('role', value)}
                                    >
                                        <SelectTrigger className="h-11 bg-background/50 border-zinc-200 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-primary" />
                                                <SelectValue placeholder="Pilih peran..." />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="siswa">Siswa</SelectItem>
                                            <SelectItem value="guru">Guru</SelectItem>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role} />
                                </div>

                                {/* Approval Checkbox */}
                                <div className="flex flex-col gap-3">
                                    <Label className="text-sm font-semibold">Status Persetujuan</Label>
                                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-background/30 h-11">
                                        <Checkbox 
                                            id="is_approved"
                                            checked={data.is_approved}
                                            onCheckedChange={(checked) => setData('is_approved', checked === true)}
                                        />
                                        <div className="flex items-center gap-2">
                                            {data.is_approved ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                            )}
                                            <Label htmlFor="is_approved" className="text-sm font-medium cursor-pointer">
                                                {data.is_approved ? 'User Langsung Aktif' : 'Butuh Persetujuan'}
                                            </Label>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Jika dicentang, pengguna dapat segera mengakses sistem setelah akun berhasil dibuat.
                                    </p>
                                    <InputError message={errors.is_approved} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href={admin.users?.index?.url ? admin.users.index.url() : '/admin/users'}>
                                Batal
                            </Link>
                        </Button>
                        <Button className="gap-2 px-8 shadow-lg shadow-primary/20" disabled={processing}>
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Simpan User Baru
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
