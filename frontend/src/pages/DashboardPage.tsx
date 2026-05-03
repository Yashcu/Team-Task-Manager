import { useState, useMemo } from 'react';
import { useProjects, useCreateProject } from '../hooks/useProjects';
import { useMyTasks } from '../hooks/useTasks';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { isToday, isBefore, startOfToday } from 'date-fns';
import { AlertTriangle, Calendar, Inbox, Layers, ListTodo } from 'lucide-react';

type DashboardTask = {
    id: string;
    title: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    dueDate?: string;
    project?: { name: string };
};

type ProjectSummary = {
    id: string;
    name: string;
    role?: string;
};

export const DashboardPage = () => {
    const { data: projects, isLoading: projectsLoading } = useProjects();
    const { data: myTasksResponse, isLoading: tasksLoading } = useMyTasks(['PENDING', 'IN_PROGRESS']);
    const createProject = useCreateProject();

    const [name, setName] = useState('');
    const myTasks = useMemo<DashboardTask[]>(() => myTasksResponse ?? [], [myTasksResponse]);

    const handleCreate = () => {
        if (!name.trim()) return;
        createProject.mutate({ name: name.trim() });
        setName('');
    };

    const stats = useMemo(() => ({
        total: myTasks.length,
        dueToday: myTasks?.filter((t) => t.dueDate && isToday(new Date(t.dueDate))).length ?? 0,
        overdue: myTasks?.filter((t) =>
            t.dueDate &&
            isBefore(new Date(t.dueDate), startOfToday())
        ).length ?? 0,
    }), [myTasks]);

    const activeTasks = useMemo(() => {
        return [...myTasks].sort((a, b) => {
            const aOverdue = a.dueDate && isBefore(new Date(a.dueDate), startOfToday());
            const bOverdue = b.dueDate && isBefore(new Date(b.dueDate), startOfToday());
            const aToday = a.dueDate && isToday(new Date(a.dueDate));
            const bToday = b.dueDate && isToday(new Date(b.dueDate));

            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            if (aToday && !bToday) return -1;
            if (!aToday && bToday) return 1;

            // No due date goes to bottom
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            return 0;
        });
    }, [myTasks]);

    if (projectsLoading || tasksLoading) {
        return <div className="text-center py-12 text-gray-500 animate-pulse">Loading...</div>;
    }

    const statCards = [
        {
            label: 'Active Tasks',
            value: stats.total,
            icon: <ListTodo className="h-5 w-5" />,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
        },
        {
            label: 'Due Today',
            value: stats.dueToday,
            icon: <Calendar className="h-5 w-5" />,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            label: 'Overdue',
            value: stats.overdue,
            icon: <AlertTriangle className="h-5 w-5" />,
            color: stats.overdue > 0 ? 'text-red-600' : 'text-gray-400',
            bg: stats.overdue > 0 ? 'bg-red-50' : 'bg-gray-50',
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
                    >
                        <div className={`${card.bg} ${card.color} rounded-lg p-2 flex-shrink-0`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">My Active Tasks</h2>
                        <span className="text-xs text-gray-400">{stats.total} assigned</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {activeTasks.length === 0 ? (
                            <div className="p-10 text-center">
                                <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-500">No active tasks</p>
                                <p className="text-xs text-gray-400 mt-1">No pending or in-progress tasks are assigned to you right now.</p>
                            </div>
                        ) : (
                            <div className="task-scroll divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
                                {activeTasks.map((task) => {
                                    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                                    const isOverdue = dueDate ? isBefore(dueDate, startOfToday()) : false;
                                    const isDueToday = dueDate ? isToday(dueDate) : false;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`p-4 hover:bg-gray-50 transition flex justify-between items-center gap-3 ${isOverdue ? 'border-l-2 border-red-400' : isDueToday ? 'border-l-2 border-amber-400' : ''
                                                }`}
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800 truncate">{task.title}</p>
                                                <div className="flex flex-wrap gap-2 text-xs mt-1 items-center">
                                                    <span className="text-indigo-600 font-medium">{task.project?.name}</span>
                                                    {isOverdue && (
                                                        <span className="text-red-500 font-semibold flex items-center gap-0.5">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            Overdue · {dueDate?.toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {isDueToday && !isOverdue && (
                                                        <span className="text-amber-600 font-semibold">Due Today</span>
                                                    )}
                                                    {dueDate && !isOverdue && !isDueToday && (
                                                        <span className="text-gray-400">
                                                            Due {dueDate.toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${task.status === 'IN_PROGRESS'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {task.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Projects Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            My Projects
                            {projects && projects.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-400">
                                    <Layers className="inline h-4 w-4 mr-1" />{projects.length}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="New project name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="bg-white"
                        />
                        <Button onClick={handleCreate} disabled={createProject.isPending || !name.trim()}>
                            {createProject.isPending ? 'Creating...' : 'Create'}
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {projects?.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 text-sm">
                                No projects found. Create one above!
                            </div>
                        ) : (
                            projects?.map((project: ProjectSummary) => (
                                <Link key={project.id} to={`/projects/${project.id}`}>
                                    <Card className="hover:border-indigo-300 transition cursor-pointer border-gray-100 shadow-sm bg-white">
                                        <CardContent className="p-4 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Role: {project.role}
                                                </p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                                {project.name.charAt(0).toUpperCase()}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
