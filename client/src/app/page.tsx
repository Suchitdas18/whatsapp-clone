'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/chat');
        } else {
            router.push('/auth/login');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">WhatsApp Clone</h1>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
