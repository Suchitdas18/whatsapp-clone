'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2, MessageCircle, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    isOnline: boolean;
}

export default function FindContactsPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        setError('');

        try {
            const response = await api.post('/contacts/search', { query });
            if (response.data.success) {
                setUsers(response.data.users);
                if (response.data.users.length === 0) {
                    setError('No users found. Try a different search.');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to search contacts');
        } finally {
            setSearching(false);
        }
    };

    const handleStartChat = async (userId: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/contacts/start-chat', {
                participantId: userId,
            });

            if (response.data.success) {
                // Navigate to the chat
                router.push(`/chat?id=${response.data.chat._id}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card">
                <div className="max-w-4xl mx-auto p-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            ←
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">Find Contacts</h1>
                            <p className="text-sm text-muted-foreground">
                                Search by name, email, or phone
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto p-4">
                <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 pr-24"
                        disabled={searching}
                    />
                    <Button
                        type="submit"
                        disabled={!query.trim() || searching}
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        size="sm"
                    >
                        {searching ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </>
                        ) : (
                            'Search'
                        )}
                    </Button>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* Results */}
                {users.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-4">
                            Found {users.length} {users.length === 1 ? 'user' : 'users'}
                        </p>

                        {users.map((user) => (
                            <div
                                key={user._id}
                                className="bg-card border rounded-lg p-4 hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <Avatar className="h-14 w-14">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="text-lg">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {user.isOnline && (
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{user.name}</h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                        {user.bio && (
                                            <p className="text-sm text-muted-foreground truncate mt-1">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                        onClick={() => handleStartChat(user._id)}
                                        disabled={loading}
                                        className="shrink-0"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <>
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!searching && users.length === 0 && !error && query && (
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <UserPlus className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No users found</h3>
                        <p className="text-muted-foreground">
                            Try searching with a different name, email, or phone number
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!query && (
                    <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Find Your Contacts</h3>
                        <p className="text-muted-foreground">
                            Search for people by their name, email, or phone number
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
