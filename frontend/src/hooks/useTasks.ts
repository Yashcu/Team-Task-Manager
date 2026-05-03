import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type StatusFilter = TaskStatus | TaskStatus[];

// GET tasks (project scoped)
export const useTasks = (
    projectId: string,
    status?: StatusFilter
) =>
    useQuery({
        queryKey: ['tasks', projectId, status],
        queryFn: async () => {
            const res = await api.get(`/api/projects/${projectId}/tasks`, {
                params: { status: Array.isArray(status) ? status.join(',') : status },
            });
            return res.data;
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });

// GET my tasks
export const useMyTasks = (status?: StatusFilter) =>
    useQuery({
        queryKey: ['my-tasks', status],
        queryFn: async () => {
            const res = await api.get(`/api/tasks/me`, {
                params: { status: Array.isArray(status) ? status.join(',') : status },
            });
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

// CREATE task (ADMIN)
export const useCreateTask = (projectId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            title: string;
            description?: string;
            assigneeId?: string;
            priority?: 'LOW' | 'MEDIUM' | 'HIGH';
            dueDate?: string;
        }) => api.post(`/api/projects/${projectId}/tasks`, data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks', projectId] });
            qc.invalidateQueries({ queryKey: ['project', projectId] });
            toast.success('Task created successfully');
        },
        onError: () => {
            toast.error('Failed to create task');
        }
    });
};

// UPDATE task details (ADMIN)
export const useUpdateTask = (projectId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            taskId: string;
            title?: string;
            description?: string | null;
            dueDate?: string | null;
        }) => {
            const { taskId, ...body } = data;
            return api.patch(`/api/projects/${projectId}/tasks/${taskId}`, body);
        },

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks', projectId] });
            qc.invalidateQueries({ queryKey: ['my-tasks'] });
            toast.success('Task updated successfully');
        },
        onError: () => {
            toast.error('Failed to update task');
        }
    });
};

// DELETE task (ADMIN)
export const useDeleteTask = (projectId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (taskId: string) =>
            api.delete(`/api/projects/${projectId}/tasks/${taskId}`),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['tasks', projectId] });
            qc.invalidateQueries({ queryKey: ['my-tasks'] });
            toast.success('Task deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete task');
        }
    });
};

// UPDATE status (ASSIGNEE)
export const useUpdateTaskStatus = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: { taskId: string; status: TaskStatus }) =>
            api.patch(`/api/tasks/${data.taskId}/status`, {
                status: data.status,
            }),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-tasks'] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task status updated');
        },
        onError: () => {
            toast.error('Failed to update task status');
        }
    });
};
