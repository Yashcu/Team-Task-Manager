import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMe } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { data, isLoading } = useMe();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

    if (!data) {
        return <Navigate to="/login" replace />;
    }

    return <>
        {children}
    </>;
};
