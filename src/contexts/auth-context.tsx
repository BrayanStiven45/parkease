'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null | undefined;
    loading: boolean;
    error: Error | undefined;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const pathname = usePathname();
    
    // The admin is hardcoded for this demo. 
    // In a real app, this would be managed via custom claims or a database role.
    const isAdmin = user?.email === 'admin@parkease.com';

    useEffect(() => {
        if (!loading) {
            const isAuthPage = pathname === '/' || pathname === '/signup';
            if (!user && !isAuthPage) {
                router.push('/');
            }
            if (user && isAuthPage) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, router, pathname]);

    const logout = async () => {
        await signOut(auth);
        router.push('/');
    };
    
    const value = { user, loading, error, isAdmin, logout };

    const isAuthPage = pathname === '/' || pathname === '/signup';
    if (loading && !isAuthPage) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
