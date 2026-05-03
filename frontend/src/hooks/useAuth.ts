import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const useMe = () =>
    useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/api/auth/me');
            return res.data;
        },
        retry: false,
    });

export const useSignup = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: { name: string; email: string; password: string }) =>
            api.post('/api/auth/signup', data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['me'] });
            navigate('/dashboard');
        },
    });
};

export const useLogin = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            api.post('/api/auth/login', data),

        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['me'] });
            navigate('/dashboard');
        },
    });
};

export const useLogout = () => {
    const navigate = useNavigate();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: () => api.post('/api/auth/logout'),
        onSuccess: () => {
            qc.clear();
            navigate('/login');
        },
    });
};
