'use client';

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null | undefined;
    loading: boolean;
    error: Error | undefined;
    isAdmin: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Create Mock Users for Demo ---
let mockUsersCreated = false;
const createMockUsers = async () => {
    if (mockUsersCreated) return;
    mockUsersCreated = true;

    const users = [
      { email: 'admin@parkease.com' },
      { email: 'user@parkease.com' },
    ];

    for (const user of users) {
        try {
            await createUserWithEmailAndPassword(auth, user.email, "password");
            console.log(`Mock user ${user.email} created successfully.`);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log(`Mock user ${user.email} already exists.`);
            } else {
                console.error(`Error creating mock user ${user.email}:`, error);
            }
        }
    }
};


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const pathname = usePathname();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            if (process.env.NODE_ENV === 'development' && !initialized) {
                await createMockUsers();
                setInitialized(true);
            }
        };
        initialize();
    }, [initialized]);

    const isAdmin = user?.email === 'admin@parkease.com';

    useEffect(() => {
        if (!loading && !user && pathname !== '/') {
            router.push('/');
        }
        if (!loading && user && pathname === '/') {
            router.push('/dashboard');
        }
    }, [user, loading, router, pathname]);

    const logout = async () => {
        await signOut(auth);
        router.push('/');
    };
    
    const value = { user, loading, error, isAdmin, logout };

    if ((loading || !initialized) && pathname !== '/') {
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
