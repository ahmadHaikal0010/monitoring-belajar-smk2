import { Link } from '@inertiajs/react';
import { FileCheck, Clock, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatDateIndonesian } from '@/lib/utils';

interface AssignmentItem {
    id: string;
    title: string;
    due_date?: string;
    status: string;
    description?: string;
}

interface Props {
    assignments?: AssignmentItem[];
}

export default function StudentAssignments({ assignments = [] }: Props) {
    const getStatusConfig = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || 'pending';

        switch (normalizedStatus) {
            case 'graded':
            case 'dinilai':
            case 'selesai':
                return {
                    label: 'Sudah Dinilai',
                    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200',
                    iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:bg-emerald-100',
                    icon: CheckCircle2,
                    actionText: 'Lihat Hasil',
                };
            case 'submitted':
            case 'dikumpulkan':
                return {
                    label: 'Dikumpulkan',
                    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200',
                    iconClass: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 group-hover:bg-blue-100',
                    icon: FileCheck,
                    actionText: 'Lihat Tugas',
                };
            case 'pending':
            case 'belum_dikumpulkan':
            default:
                return {
                    label: 'Belum Dikumpulkan',
                    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200',
                    iconClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 group-hover:bg-amber-100',
                    icon: Clock,
                    actionText: 'Kerjakan',
                };
        }
    };

    return (
        <div className="space-y-3 outline-none text-left">
            <h2 className="text-lg font-bold flex items-center justify-start gap-2 text-left">
                <FileCheck className="h-5 w-5 text-primary" />
                <span>Daftar Tugas</span>
            </h2>

            {assignments.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 text-left">
                    {assignments.map((assignment) => {
                        const config = getStatusConfig(assignment.status);
                        const StatusIcon = config.icon;

                        return (
                            <Link
                                key={assignment.id}
                                href={`/student/assignments/${assignment.id}`}
                                className="block group outline-none rounded-xl"
                            >
                                <Card className="p-4 !py-4 !flex-row border border-zinc-200/80 dark:border-zinc-800 bg-card/50 hover:bg-accent/50 hover:border-primary/40 shadow-sm hover:shadow-md transition-all items-center justify-between gap-4 cursor-pointer text-left">
                                    <div className="flex items-center gap-3.5 min-w-0 text-left flex-1">
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors", config.iconClass)}>
                                            <StatusIcon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 space-y-0.5 text-left flex-1">
                                            <div className="flex flex-wrap items-center justify-start gap-2">
                                                <Badge variant="outline" className={cn("border font-semibold text-[10px]", config.badgeClass)}>
                                                    {config.label}
                                                </Badge>

                                                {assignment.due_date && (
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Tenggat: {formatDateIndonesian(assignment.due_date)}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm truncate text-left">
                                                {assignment.title}
                                            </h3>

                                            {assignment.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-xl text-left">
                                                    {assignment.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button size="sm" variant="ghost" className="gap-1 text-xs text-primary group-hover:translate-x-0.5 transition-transform pointer-events-none">
                                            <span>{config.actionText}</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <Card className="p-8 text-left bg-card/50 border-none shadow-xl backdrop-blur-sm space-y-2">
                    <div className="flex items-center gap-3 text-left">
                        <Clock className="h-6 w-6 text-muted-foreground shrink-0" />
                        <div className="text-left">
                            <h3 className="text-base font-bold text-left">Belum Ada Tugas Tersedia</h3>
                            <p className="text-xs text-muted-foreground text-left">
                                Pengampu belum menerbitkan tugas untuk mata pelajaran ini.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
