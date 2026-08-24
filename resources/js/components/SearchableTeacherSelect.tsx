import { Search, User, Check, ChevronsUpDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface TeacherItem {
    id: string;
    name: string;
}

interface SearchableTeacherSelectProps {
    teachers: TeacherItem[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function SearchableTeacherSelect({
    teachers,
    value,
    onChange,
    error,
}: SearchableTeacherSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedTeacher = teachers.find((t) => t.id === value);

    const filteredTeachers = teachers.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <div className="grid gap-2">
            <Label htmlFor="teacher_id" className="flex items-center gap-2 font-semibold">
                <User className="h-4 w-4 text-primary" />
                Guru Pengampu
            </Label>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={isOpen}
                        className="h-11 w-full justify-between border-zinc-200 bg-background/50 dark:border-zinc-800"
                    >
                        {selectedTeacher ? (
                            <div className="flex items-center gap-2 overflow-hidden">
                                <User className="h-4 w-4 shrink-0 text-primary" />
                                <span className="truncate font-medium">
                                    {selectedTeacher.name}
                                </span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground">
                                Pilih Guru Pengampu...
                            </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-[calc(100vw-3rem)] max-h-72 overflow-hidden p-0 md:w-[500px]"
                    align="start"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center border-b p-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            ref={inputRef}
                            placeholder="Cari nama guru..."
                            className="h-9 border-none bg-transparent focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto p-1">
                        {filteredTeachers.length > 0 ? (
                            filteredTeachers.map((teacher) => {
                                const isSelected = teacher.id === value;

                                return (
                                    <button
                                        key={teacher.id}
                                        type="button"
                                        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                                            isSelected ? 'bg-accent/50 font-semibold' : ''
                                        }`}
                                        onClick={() => {
                                            onChange(teacher.id);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate">{teacher.name}</span>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Guru tidak ditemukan.
                            </div>
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
            <InputError message={error} />
        </div>
    );
}
