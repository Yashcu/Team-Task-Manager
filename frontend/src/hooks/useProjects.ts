import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';

// GET projects
export const useProjects = () =>
    useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await api.get('/api/projects');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

// CREATE project
export const useCreateProject = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; description?: string }) =>
            api.post('/api/projects', data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project created successfully');
        },
        onError: () => {
            toast.error('Failed to create project');
        }
    });
};

// GET single project
export const useProject = (projectId: string) =>
    useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const res = await api.get(`/api/projects/${projectId}`);
            return res.data;
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });

// ADD MEMBER
export const useAddMember = (projectId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: { email: string; role?: 'ADMIN' | 'MEMBER' }) =>
            api.post(`/api/projects/${projectId}/members`, data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['project', projectId] });
            toast.success('Member added successfully');
        },
        onError: () => {
            toast.error('Failed to add member');
        }
    });
};

// UPDATE PROJECT
export const useUpdateProject = (projectId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: { name?: string; description?: string }) =>
            api.patch(`/api/projects/${projectId}`, data),
        
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['project', projectId] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project updated successfully');
        },
        onError: () => {
            toast.error('Failed to update project');
        }
    });
};

// DELETE PROJECT
export const useDeleteProject = (projectId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => api.delete(`/api/projects/${projectId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete project');
        }
    });
};