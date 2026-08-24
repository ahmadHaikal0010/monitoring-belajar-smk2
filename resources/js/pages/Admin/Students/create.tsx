import { Head, router, useForm, setLayoutProps, Link } from '@inertiajs/react';
import {
    Search,
    User,
    ArrowLeft,
    Save,
    Fingerprint,
    Info,
    Check,
    ChevronsUpDown,
    Loader2,
    MapPin,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    assignableUsers: PaginatedData<User>;
    filters: {
        search?: string;
    };
}

export default function CreateStudent({ assignableUsers, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    setLayoutProps({
        breadcrumbs: [
            {
                title: 'Daftar Siswa',
                href: admin.students.index.url(),
            },
            {
                title: 'Tambah Siswa',
                href: admin.students.create.url(),
            },
        ],
    });

    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        nisn: '',
        address: '',
        photo: null as File | null,
    });

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSearch = useCallback((value: string) => {
        setIsSearching(true);
        router.get(
            admin.students.create.url(),
            { search: value },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['assignableUsers'],
                onFinish: () => setIsSearching(false),
            },
        );
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                handleSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, handleSearch, filters.search]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setData('user_id', user.id.toString());
        setIsOpen(false);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(admin.students.store.url());
    };

    return (
        <>
            <Head title="Tambah Siswa Baru" />

            <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="shrink-0"
                    >
                        <Link href={admin.students.index.url()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Tambah Siswa Baru
                        </h1>
                        <p className="text-muted-foreground">
                            Hubungkan akun user yang sudah ada ke profil siswa
                            baru.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6">
                    <Card className="border-none bg-card/50 p-6 shadow-xl backdrop-blur-sm">
                        <div className="grid gap-6">
                            {/* User Selection */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="user_id"
                                    className="text-sm font-semibold"
                                >
                                    Pilih Akun User
                                </Label>
                                <DropdownMenu
                                    open={isOpen}
                                    onOpenChange={setIsOpen}
                                >
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isOpen}
                                            className="h-12 w-full justify-between border-zinc-200 bg-background/50 dark:border-zinc-800"
                                        >
                                            {selectedUser ? (
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <User className="h-4 w-4 shrink-0 text-primary" />
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="truncate font-medium">
                                                            {selectedUser.name}
                                                        </span>
                                                        <span className="truncate text-[10px] text-muted-foreground">
                                                            {selectedUser.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Cari user berdasarkan nama
                                                    atau email...
                                                </span>
                                            )}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-[calc(100vw-3rem)] p-0 md:w-[600px]"
                                        align="start"
                                        onCloseAutoFocus={(e) =>
                                            e.preventDefault()
                                        }
                                    >
                                        <div className="flex items-center border-b p-2">
                                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            <Input
                                                ref={inputRef}
                                                placeholder="Ketik untuk mencari user..."
                                                className="h-9 border-none bg-transparent focus-visible:ring-0"
                                                value={searchTerm}
                                                onChange={(e) =>
                                                    setSearchTerm(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                            {isSearching && (
                                                <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto p-1">
                                            {assignableUsers.data.length > 0 ? (
                                                assignableUsers.data.map(
                                                    (user) => (
                                                        <DropdownMenuItem
                                                            key={user.id}
                                                            onSelect={() =>
                                                                handleSelectUser(
                                                                    user,
                                                                )
                                                            }
                                                            className="flex cursor-pointer items-center justify-between p-3 transition-colors focus:bg-zinc-100 focus:text-foreground dark:focus:bg-zinc-800"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">
                                                                    {user.name}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                            {selectedUser?.id ===
                                                                user.id && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                        </DropdownMenuItem>
                                                    ),
                                                )
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    User tidak ditemukan atau
                                                    sudah menjadi siswa.
                                                </div>
                                            )}
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <InputError message={errors.user_id} />
                                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Info className="h-3 w-3" />
                                    Hanya menampilkan akun yang belum terdaftar
                                    sebagai siswa.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-1">
                                {/* NISN */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="nisn"
                                        className="text-sm font-semibold"
                                    >
                                        NISN (10 Karakter)
                                    </Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="nisn"
                                            placeholder="Contoh: 1234567890"
                                            className="h-11 border-zinc-200 bg-background/50 pl-9 dark:border-zinc-800"
                                            value={data.nisn}
                                            onChange={(e) =>
                                                setData('nisn', e.target.value)
                                            }
                                            maxLength={10}
                                        />
                                    </div>
                                    <InputError message={errors.nisn} />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="address"
                                    className="text-sm font-semibold"
                                >
                                    Alamat Lengkap
                                </Label>
                                <div className="relative">
                                    <MapPin className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                    <textarea
                                        id="address"
                                        rows={3}
                                        placeholder="Ketikkan alamat lengkap siswa..."
                                        className="flex w-full rounded-md border border-zinc-200 bg-background/50 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                    />
                                </div>
                                <InputError message={errors.address} />
                            </div>

                            {/* Photo Upload */}
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="photo"
                                    className="text-sm font-semibold"
                                >
                                    Foto Profil
                                </Label>
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
                                    Format: JPG, PNG, WEBP. Maks: 2MB.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" asChild disabled={processing}>
                            <Link href={admin.students.index.url()}>Batal</Link>
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
                            Simpan Data Siswa
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
