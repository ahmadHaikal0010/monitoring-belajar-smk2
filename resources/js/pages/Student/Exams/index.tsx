import { Link } from '@inertiajs/react';
import { GraduationCap, Clock, ChevronRight, Timer, Calendar, CheckCircle2, PlayCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, formatDateIndonesian } from '@/lib/utils';

interface StudentSession {
    id: string;
    status: 'in_progress' | 'submitted' | 'graded' | 'timed_out' | string;
    total_score?: number | null;
}

interface ExamItem {
    id: string;
    title: string;
    description?: string;
    duration: number;
    pass_score?: number;
    start_time?: string;
    end_time?: string;
    total_questions?: number;
    student_session?: StudentSession | null;
}

interface Props {
    exams?: ExamItem[];
}

export default function StudentExams({ exams = [] }: Props) {
    const getExamStatusConfig = (session?: StudentSession | null) => {
        const sessionStatus = session?.status?.toLowerCase();

        switch (sessionStatus) {
            case 'submitted':
            case 'graded':
            case 'timed_out':
                return {
                    label: 'Sudah Dikerjakan',
                    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200',
                    iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:bg-emerald-100',
                    icon: CheckCircle2,
                    actionText: 'Lihat Hasil',
                };
            case 'in_progress':
                return {
                    label: 'Sedang Dikerjakan',
                    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 animate-pulse',
                    iconClass: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 group-hover:bg-amber-100',
                    icon: PlayCircle,
                    actionText: 'Lanjutkan',
                };
            default:
                return {
                    label: 'Belum Dikerjakan',
                    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200',
                    iconClass: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 group-hover:bg-purple-100',
                    icon: GraduationCap,
                    actionText: 'Kerjakan Ujian',
                };
        }
    };

    return (
        <div className="space-y-3 outline-none text-left">
            <h2 className="text-lg font-bold flex items-center justify-start gap-2 text-left">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>Daftar Ujian</span>
            </h2>

            {exams.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 text-left">
                    {exams.map((exam) => {
                        const config = getExamStatusConfig(exam.student_session);
                        const StatusIcon = config.icon;

                        return (
                            <Link
                                key={exam.id}
                                href={`/student/exams/${exam.id}`}
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

                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <Timer className="h-3 w-3" />
                                                    <span>{exam.duration} Menit</span>
                                                </span>

                                                {exam.student_session?.status === 'graded' && exam.student_session.total_score !== null && (
                                                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        • Skor: {exam.student_session.total_score}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm truncate text-left">
                                                {exam.title}
                                            </h3>

                                            {(exam.start_time || exam.end_time) && (
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                                                    {exam.start_time && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Mulai: {formatDateIndonesian(exam.start_time)}</span>
                                                        </span>
                                                    )}
                                                    {exam.end_time && (
                                                        <span className="flex items-center gap-1">
                                                            <span>• Selesai: {formatDateIndonesian(exam.end_time)}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {exam.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-xl text-left">
                                                    {exam.description}
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
                            <h3 className="text-base font-bold text-left">Belum Ada Ujian Tersedia</h3>
                            <p className="text-xs text-muted-foreground text-left">
                                Pengampu belum memublikasikan ujian untuk mata pelajaran ini.
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
