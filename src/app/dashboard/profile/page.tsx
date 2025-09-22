
'use client';

import ProfileForm from '@/components/dashboard/profile-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="text-center">Cargando...</div>;
    }

    return (
        <div className="w-full">
            <ProfileForm />
        </div>
    );
}
