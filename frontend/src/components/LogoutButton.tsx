import { useState } from 'react';
import { useLogout } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export const LogoutButton = () => {
    const logout = useLogout();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleLogout}
            disabled={isLoggingOut}
        >
            {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <LogOut className="mr-2 h-4 w-4" />
            )}
            {isLoggingOut ? 'Logging out...' : 'Log out'}
        </Button>
    );
};
