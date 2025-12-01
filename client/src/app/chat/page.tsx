'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ChatList } from '@/components/chat/ChatList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon } from 'lucide-react';
import socketService from '@/lib/socket';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ChatPage() {
    const router = useRouter();
    const { user, token, isAuthenticated, logout } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            router.push('/auth/login');
            return;
        }

        // Connect to socket
        socketService.connect(token);

        // Cleanup on unmount
        return () => {
            socketService.disconnect();
        };
    }, [isAuthenticated, token, router]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            socketService.disconnect();
            router.push('/auth/login');
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Top Header */}
            <div className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-semibold text-foreground">{user.name}</h2>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DarkModeToggle />
                    <Link href="/profile">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <UserIcon className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="rounded-full"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="flex flex-1 overflow-hidden">
                <ChatList />
                <ChatRoom />
            </div>
        </div>
    );
}
