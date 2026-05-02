import { Navigate } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';
import type React from 'react';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { data, isLoading } = useMe();

    if (isLoading) return null;

    if (data) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
