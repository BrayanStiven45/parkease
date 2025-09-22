'use client';

import CreateBranchForm from '@/components/admin/create-branch-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewBranchPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [isAdmin, loading, router]);

    if (loading || !isAdmin) {
        return <div className="text-center">Cargando...</div>;
    }

    return (
        <div className="w-full">
            <CreateBranchForm />
        </div>
    );
}
