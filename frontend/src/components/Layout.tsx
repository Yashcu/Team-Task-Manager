import { Link } from 'react-router-dom';
import { useLogout, useMe } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';
import { Button } from './ui/button';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const logout = useLogout();
    const { data: user } = useMe();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/dashboard" className="text-xl font-bold tracking-tight text-blue-600">
                            Taskify
                        </Link>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                            <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-2 mr-2">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs ring-1 ring-slate-900/5">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                    {user.name}
                                </span>
                            </div>
                        )}
                        <Button variant="outline" onClick={() => logout.mutate()} disabled={logout.isPending} className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                            <LogOut className="mr-2 h-4 w-4" />
                            {logout.isPending ? 'Logging out...' : 'Log out'}
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 max-w-6xl w-full mx-auto p-6">
                {children}
            </main>
        </div>
    );
};
