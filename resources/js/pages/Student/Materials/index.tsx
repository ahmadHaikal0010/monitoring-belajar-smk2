import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Video,
    FileText,
    Globe,
    CheckCircle2,
    Clock,
    ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MaterialItem {
    id: string;
    title: string;
    content_type: 'video' | 'document' | 'url';
    description?: string;
    created_at: string;
    is_completed: boolean;
}

interface Props {
    materials: MaterialItem[];
}

const TypeIcon = ({ type }: { type: MaterialItem['content_type'] }) => {
    switch (type) {
        case 'video':
            return <Video className="h-4 w-4 text-rose-500" />;
        case 'document':
            return <FileText className="h-4 w-4 text-blue-500" />;
        case 'url':
            return <Globe className="h-4 w-4 text-emerald-500" />;
        default:
            return <FileText className="h-4 w-4" />;
    }
};

const TypeBadge = ({ type }: { type: MaterialItem['content_type'] }) => {
    const labels = {
        video: 'Video',
        document: 'Dokumen',
        url: 'Tautan',
    };

    const colors = {
        video: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        url: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    };

    return (
        <Badge variant="outline" className={cn('border-none font-semibold text-[10px]', colors[type])}>
            {labels[type]}
        </Badge>
    );
};

export default function StudentMaterials({ materials }: Props) {
    return (
        <div className="space-y-3 outline-none text-left">
            <h2 className="text-lg font-bold flex items-center justify-start gap-2 text-left">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Daftar Materi Pembelajaran</span>
            </h2>

            {materials.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 text-left">
                    {materials.map((m) => (
                        <Link
                            key={m.id}
                            href={`/student/materials/${m.id}`}
                            className="block group outline-none rounded-xl"
                        >
                            <Card className="p-4 !py-4 !flex-row border border-zinc-200/80 dark:border-zinc-800 bg-card/50 hover:bg-accent/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all items-center justify-between gap-4 cursor-pointer text-left">
                                <div className="flex items-center gap-3.5 min-w-0 text-left flex-1">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                                        m.is_completed
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                                            : "bg-muted text-muted-foreground border-transparent group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <TypeIcon type={m.content_type} />
                                    </div>

                                    <div className="min-w-0 space-y-0.5 text-left flex-1">
                                        <div className="flex items-center justify-start gap-2">
                                            <TypeBadge type={m.content_type} />
                                            {m.is_completed && (
                                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-none text-[10px] gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>Selesai</span>
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm truncate text-left">
                                            {m.title}
                                        </h3>
                                        {m.description && (
                                            <p className="text-xs text-muted-foreground truncate max-w-xl text-left">
                                                {m.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Button size="sm" variant="ghost" className="gap-1 text-xs text-primary group-hover:translate-x-0.5 transition-transform pointer-events-none">
                                        <span>Pelajari</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="p-8 text-left bg-card/50 border-none shadow-xl backdrop-blur-sm space-y-2">
                    <div className="flex items-center gap-3 text-left">
                        <Clock className="h-6 w-6 text-muted-foreground shrink-0" />
                        <div className="text-left">
                            <h3 className="text-base font-bold text-left">Belum Ada Materi Tersedia</h3>
                            <p className="text-xs text-muted-foreground text-left">
                                Pengampu belum mengunggah materi pembelajaran untuk mata pelajaran ini.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
