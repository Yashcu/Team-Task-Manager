import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useAddMember, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import {
    useCreateTask,
    useDeleteTask,
    useTasks,
    type TaskStatus,
    useUpdateTask,
    useUpdateTaskStatus,
} from '../hooks/useTasks';
import { TaskCard, type Task } from '@/components/TaskCard';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/Modal';
import { Plus, UserPlus, Edit2, Trash2 } from 'lucide-react';

type ProjectMember = {
    role: 'ADMIN' | 'MEMBER';
    user: {
        id: string;
        name: string;
        email: string;
    };
};

type TaskColumn = {
    status: TaskStatus;
    title: string;
    countClassName: string;
    columnClassName: string;
    emptyText: string;
};

const taskColumns: TaskColumn[] = [
    {
        status: 'PENDING',
        title: 'To Do',
        countClassName: 'bg-slate-100 text-slate-600',
        columnClassName: 'bg-slate-50/50 border-slate-200/60',
        emptyText: 'No tasks to do.',
    },
    {
        status: 'IN_PROGRESS',
        title: 'In Progress',
        countClassName: 'bg-blue-50 text-blue-600',
        columnClassName: 'bg-blue-50/30 border-blue-100/60',
        emptyText: 'Nothing in progress.',
    },
    {
        status: 'COMPLETED',
        title: 'Completed',
        countClassName: 'bg-emerald-50 text-emerald-600',
        columnClassName: 'bg-emerald-50/30 border-emerald-100/60',
        emptyText: 'No completed tasks yet.',
    },
];

export const ProjectPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading: projectLoading } = useProject(id!);
    const updateProject = useUpdateProject(id!);
    const deleteProject = useDeleteProject(id!);
    const pendingTasks = useTasks(id!, 'PENDING');
    const inProgressTasks = useTasks(id!, 'IN_PROGRESS');
    const completedTasks = useTasks(id!, 'COMPLETED');

    const createTask = useCreateTask(id!);
    const updateTask = useUpdateTask(id!);
    const deleteTask = useDeleteTask(id!);
    const updateStatus = useUpdateTaskStatus();
    const addMember = useAddMember(id!);

    // Project Modal State
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [projectForm, setProjectForm] = useState({ name: '', description: '' });

    // Task Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: '',
        assigneeId: ''
    });
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskForm, setEditTaskForm] = useState({
        title: '',
        description: '',
        dueDate: '',
    });

    // Member Modal State
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [memberEmail, setMemberEmail] = useState('');

    // Tabs State
    const [activeTab, setActiveTab] = useState<'ALL' | TaskStatus>('ALL');

    const tabs = [
        { id: 'ALL', label: 'All Tasks' },
        { id: 'PENDING', label: 'To Do' },
        { id: 'IN_PROGRESS', label: 'In Progress' },
        { id: 'COMPLETED', label: 'Completed' },
    ] as const;

    const tasksLoading = pendingTasks.isLoading || inProgressTasks.isLoading || completedTasks.isLoading;

    const taskData = {
        PENDING: pendingTasks.data,
        IN_PROGRESS: inProgressTasks.data,
        COMPLETED: completedTasks.data,
    };

    const allTasks = useMemo(() => {
        return [
            ...(taskData.PENDING || []),
            ...(taskData.IN_PROGRESS || []),
            ...(taskData.COMPLETED || [])
        ];
    }, [taskData.PENDING, taskData.IN_PROGRESS, taskData.COMPLETED]);

    const displayedTasks = activeTab === 'ALL' ? allTasks : (taskData[activeTab] || []);

    if (projectLoading || tasksLoading) return <div className="text-center py-12 text-slate-500">Loading project details...</div>;

    const isAdmin = project?.currentUserRole === 'ADMIN';
    const projectMembers: ProjectMember[] = project?.members ?? [];

    const handleCreateTask = () => {
        if (!taskForm.title) return;
        createTask.mutate({
            title: taskForm.title,
            description: taskForm.description || undefined,
            priority: taskForm.priority,
            dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
            assigneeId: taskForm.assigneeId || undefined,
        }, {
            onSuccess: () => {
                setIsTaskModalOpen(false);
                setTaskForm({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    dueDate: '',
                    assigneeId: ''
                });
            }
        });
    };

    const openEditTask = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTaskForm({
            title: task.title,
            description: task.description ?? '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
        });
    };

    const handleUpdateTask = () => {
        if (!editingTaskId || !editTaskForm.title.trim()) return;

        updateTask.mutate({
            taskId: editingTaskId,
            title: editTaskForm.title.trim(),
            description: editTaskForm.description.trim() || null,
            dueDate: editTaskForm.dueDate ? new Date(editTaskForm.dueDate).toISOString() : null,
        }, {
            onSuccess: () => {
                setEditingTaskId(null);
            }
        });
    };

    const handleDeleteTask = (taskId: string) => {
        if (!window.confirm('Delete this task?')) return;
        deleteTask.mutate(taskId);
    };

    const handleAddMember = () => {
        if (!memberEmail) return;
        addMember.mutate({ email: memberEmail }, {
            onSuccess: () => {
                setIsMemberModalOpen(false);
                setMemberEmail('');
            }
        });
    };

    const handleEditProjectClick = () => {
        setProjectForm({ name: project.name, description: project.description || '' });
        setIsEditProjectModalOpen(true);
    };

    const handleUpdateProject = () => {
        if (!projectForm.name.trim()) return;
        updateProject.mutate({ name: projectForm.name, description: projectForm.description || undefined }, {
            onSuccess: () => setIsEditProjectModalOpen(false)
        });
    };

    const handleDeleteProject = () => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
        deleteProject.mutate(undefined, {
            onSuccess: () => navigate('/')
        });
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 truncate">{project.name}</h1>
                    <p className="text-sm text-slate-500 mt-1 truncate">
                        {project.description || 'No description provided.'}
                    </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                    {projectMembers.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-400">Team</span>
                            <div className="flex -space-x-2">
                                {projectMembers.map((m) => (
                                    <div key={m.user.id} className="h-8 w-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs ring-1 ring-slate-900/5" title={`${m.user.name} (${m.role})`}>
                                        {m.user.name.charAt(0).toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <>
                            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={handleEditProjectClick} className="text-slate-500 hover:text-slate-900 border-slate-200" title="Edit Project">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleDeleteProject} disabled={deleteProject.isPending} className="text-slate-500 hover:text-red-600 border-slate-200" title="Delete Project">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => setIsMemberModalOpen(true)} className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                                    <UserPlus className="h-4 w-4" /> Invite
                                </Button>
                                <Button onClick={() => setIsTaskModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                    <Plus className="h-4 w-4" /> New Task
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* List View Container with Tabs */}
            <div className="space-y-0 pt-2">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
                    {tabs.map((tab) => {
                        const count = tab.id === 'ALL' 
                            ? allTasks.length 
                            : (taskData[tab.id as TaskStatus]?.length || 0);
                            
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                                    activeTab === tab.id
                                        ? 'border-blue-600 text-blue-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                {tab.label}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="pt-6 flex flex-col gap-2">
                    {displayedTasks.length > 0 ? (
                        displayedTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                currentUserId={project.currentUserId}
                                isAdmin={isAdmin}
                                onEdit={openEditTask}
                                onDelete={handleDeleteTask}
                                onStatusChange={(taskId, status) => updateStatus.mutate({ taskId, status })}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 border border-slate-200 border-dashed rounded-xl bg-slate-50/50">
                            <p className="text-sm text-slate-500 font-medium">No tasks found</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {activeTab === 'ALL' ? 'Get started by creating a new task.' : `No tasks in ${tabs.find(t => t.id === activeTab)?.label}.`}
                            </p>
                            {isAdmin && activeTab === 'ALL' && (
                                <Button onClick={() => setIsTaskModalOpen(true)} className="mt-4 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
                                    <Plus className="h-4 w-4 mr-2" /> Create Task
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
                        <Input placeholder="E.g., Update landing page..." value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <textarea
                            className="w-full flex min-h-[100px] rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            placeholder="Add more details..."
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Assignee</label>
                            <select value={taskForm.assigneeId} onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow">
                                <option value="">Unassigned</option>
                                {projectMembers.map((m) => (
                                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Priority</label>
                            <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Due Date <span className="text-slate-400 font-normal">(Optional)</span></label>
                        <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                    </div>
                    <Button onClick={handleCreateTask} disabled={createTask.isPending || !taskForm.title} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                        {createTask.isPending ? 'Creating...' : 'Create Task'}
                    </Button>
                </div>
            </Modal>

            {/* Edit Task Modal */}
            <Modal isOpen={!!editingTaskId} onClose={() => setEditingTaskId(null)} title="Edit Task">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
                        <Input value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                        <textarea
                            className="w-full flex min-h-[100px] rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            value={editTaskForm.description}
                            onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Due Date</label>
                        <Input type="date" value={editTaskForm.dueDate} onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })} />
                    </div>
                    <Button onClick={handleUpdateTask} disabled={updateTask.isPending || !editTaskForm.title.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                        {updateTask.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Modal>

            {/* Invite Member Modal */}
            <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Invite Team Member">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Invite a user to collaborate on {project.name}. They must already have an account.</p>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address</label>
                        <Input type="email" placeholder="colleague@example.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
                    </div>
                    <Button onClick={handleAddMember} disabled={addMember.isPending || !memberEmail} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                        {addMember.isPending ? 'Inviting...' : 'Send Invite'}
                    </Button>
                </div>
            </Modal>

            {/* Edit Project Modal */}
            <Modal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} title="Edit Project">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Project Name</label>
                        <Input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">Description</label>
                        <textarea
                            className="w-full flex min-h-[100px] rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            value={projectForm.description}
                            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleUpdateProject} disabled={updateProject.isPending || !projectForm.name.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                        {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
