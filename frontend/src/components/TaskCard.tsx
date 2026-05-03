import { AlertCircle, Calendar, CheckCircle2, Pencil, Trash2, Check, ArrowRight } from 'lucide-react';
import { isBefore, startOfToday } from 'date-fns';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
    updatedAt: string;
    assigneeId?: string;
    assignee?: { id: string; name: string };
}

interface TaskCardProps {
    task: Task;
    currentUserId: string;
    isAdmin?: boolean;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const nextStatus: Record<Exclude<TaskStatus, 'COMPLETED'>, TaskStatus> = {
    PENDING: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
};

const getNextStatus = (status: TaskStatus) => {
    if (status === 'COMPLETED') return null;
    return nextStatus[status];
};

export const TaskCard = ({
    task,
    currentUserId,
    isAdmin = false,
    onEdit,
    onDelete,
    onStatusChange,
}: TaskCardProps) => {
    const isOverdue =
        task.status !== 'COMPLETED' &&
        !!task.dueDate &&
        isBefore(new Date(task.dueDate), startOfToday());
    const canChangeStatus = task.assigneeId === currentUserId && task.status !== 'COMPLETED';
    const next = canChangeStatus ? getNextStatus(task.status) : null;

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-3 sm:px-4 sm:py-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className="mt-0.5 sm:mt-0 shrink-0">
                    {task.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : next ? (
                        <button
                            onClick={() => onStatusChange(task.id, next)}
                            className="h-5 w-5 rounded-full border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center text-transparent hover:text-blue-600 transition-colors"
                            title={`Mark as ${next.replace('_', ' ').toLowerCase()}`}
                        >
                            {next === 'COMPLETED' ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                        </button>
                    ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-100 bg-slate-50" title="Cannot change status" />
                    )}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h4
                            className={`font-medium text-sm truncate ${
                                task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'
                            }`}
                        >
                            {task.title}
                        </h4>
                        <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                                task.priority === 'HIGH'
                                    ? 'bg-red-50 text-red-600'
                                    : task.priority === 'MEDIUM'
                                    ? 'bg-amber-50 text-amber-600'
                                    : 'bg-emerald-50 text-emerald-600'
                            }`}
                        >
                            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                    </div>
                    {task.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{task.description}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 mt-2 sm:mt-0 ml-8 sm:ml-0">
                {task.status === 'COMPLETED' ? (
                    <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5">
                        Done {new Date(task.updatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                ) : task.dueDate && (
                    <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                            isOverdue ? 'text-red-600' : 'text-slate-500'
                        }`}
                        title={isOverdue ? 'Overdue' : 'Due date'}
                    >
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                        })}
                        {isOverdue && <AlertCircle className="h-3.5 w-3.5" />}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {task.assignee ? (
                        <div
                            className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-[10px] ring-1 ring-slate-900/5"
                            title={`Assigned to ${task.assignee.name}`}
                        >
                            {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                    ) : (
                        <div
                            className="h-6 w-6 rounded-full bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center"
                            title="Unassigned"
                        />
                    )}

                    {isAdmin && task.status !== 'COMPLETED' ? (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity w-[52px] justify-end">
                            <button
                                type="button"
                                onClick={() => onEdit?.(task)}
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                aria-label="Edit task"
                                title="Edit task"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete?.(task.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                aria-label="Delete task"
                                title="Delete task"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-[52px] hidden sm:block" /> 
                    )}
                </div>
            </div>
        </div>
    );
};
