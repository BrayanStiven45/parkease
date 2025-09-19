
'use client';

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface UserData {
    username: string;
    parkingLotName: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null | undefined;
    userData: UserData | null;
    loading: boolean;
    error: Error | undefined;
    isAdmin: boolean;
    logout: () => Promise<void>;
    forceReloadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, loading, error] = useAuthState(auth);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isUserDataLoading, setIsUserDataLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    
    const isAdmin = user?.email === 'admin@parkease.com';

    const fetchUserData = useCallback(async (user: User | null) => {
        if (user) {
            setIsUserDataLoading(true);
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData);
            }
            setIsUserDataLoading(false);
        } else {
            setUserData(null);
            setIsUserDataLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData(user);
    }, [user, fetchUserData]);

    const forceReloadUserData = useCallback(async () => {
        if (auth.currentUser) {
            await fetchUserData(auth.currentUser);
        }
    }, [fetchUserData]);

    useEffect(() => {
        if (!loading && !isUserDataLoading) {
            const isAuthPage = pathname === '/';
            const isSignupPage = pathname === '/signup';
            
            if (!user && !isAuthPage && !isSignupPage) {
                router.push('/');
            }
            if (user && isAuthPage) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, isUserDataLoading, router, pathname]);

    const logout = async () => {
        await signOut(auth);
        setUserData(null);
        router.push('/');
    };
    
    const value = { user, userData, loading, error, isAdmin, logout, forceReloadUserData };

    const isAuthPage = pathname === '/' || pathname === '/signup';
    if ((loading || isUserDataLoading) && !isAuthPage) {
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
