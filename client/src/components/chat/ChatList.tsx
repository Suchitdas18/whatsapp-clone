'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useChatStore, Chat } from '@/store/chatStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, Loader2, Users, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import {
    getChatName,
    getChatAvatar,
    getChatOnlineStatus,
    getInitials,
    formatChatListTime,
    truncateText
} from '@/lib/utils';
import { MessageStatus } from './MessageStatus';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export function ChatList() {
    const { user } = useAuthStore();
    const { chats, setChats, currentChat, setCurrentChat } = useChatStore();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);

    // Fetch chats on mount
    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        setLoading(true);
        try {
            const response = await api.get('/chats');
            if (response.data.success) {
                setChats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const response = await api.get(`/users?search=${searchQuery}`);
                if (response.data.success) {
                    setSearchResults(response.data.data);
                }
            } catch (error) {
                console.error('Error searching users:', error);
            } finally {
                setSearching(false);
            }
        };

        const debounce = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleCreateChat = async (userId: string) => {
        try {
            const response = await api.post('/chats', { userId });
            if (response.data.success) {
                const newChat = response.data.data;

                // Check if chat already exists in list
                const exists = chats.find(c => c._id === newChat._id);
                if (!exists) {
                    setChats([newChat, ...chats]);
                }

                setCurrentChat(newChat);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const getLastMessagePreview = (chat: Chat) => {
        if (!chat.lastMessage) return 'No messages yet';

        const msg = chat.lastMessage;
        const isSent = msg.sender._id === user?._id;
        const prefix = isSent ? 'You: ' : '';

        if (msg.isDeleted) return `${prefix}This message was deleted`;
        if (msg.type === 'image') return `${prefix}📷 Image`;
        if (msg.type === 'video') return `${prefix}🎥 Video`;
        if (msg.type === 'document') return `${prefix}📄 Document`;
        if (msg.type === 'audio') return `${prefix}🎵 Audio`;

        return `${prefix}${truncateText(msg.content, 30)}`;
    };

    const getUnreadCount = (chat: Chat) => {
        // Placeholder - implement unread count logic
        return 0;
    };

    return (
        <div className="w-full md:w-96 border-r border-border bg-background flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-foreground">Chats</h1>
                    <Link href="/contacts">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <UserPlus className="h-4 w-4" />
                            Find Contacts
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users or chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="border-b border-border">
                                <div className="px-4 py-2 text-xs font-semibold text-muted-foreground">
                                    SEARCH RESULTS
                                </div>
                                {searchResults.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleCreateChat(user._id)}
                                        className="flex items-center gap-3 p-4 hover:bg-accent cursor-pointer transition-colors"
                                    >
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-foreground truncate">
                                                {user.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        {user.isOnline && (
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Chat List */}
                        {chats.length === 0 && !loading && searchResults.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                                <h3 className="font-medium text-foreground mb-2">
                                    No conversations yet
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Search for users to start chatting
                                </p>
                            </div>
                        ) : (
                            <div>
                                {chats.map((chat) => {
                                    const chatName = getChatName(chat, user?._id || '');
                                    const chatAvatar = getChatAvatar(chat, user?._id || '');
                                    const isOnline = getChatOnlineStatus(chat, user?._id || '');
                                    const isActive = currentChat?._id === chat._id;
                                    const unreadCount = getUnreadCount(chat);

                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() => setCurrentChat(chat)}
                                            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${isActive
                                                ? 'bg-accent'
                                                : 'hover:bg-accent/50'
                                                }`}
                                        >
                                            <div className="relative">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={chatAvatar} alt={chatName} />
                                                    <AvatarFallback>{getInitials(chatName)}</AvatarFallback>
                                                </Avatar>
                                                {isOnline && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-medium text-foreground truncate">
                                                        {chat.isGroupChat && '👥 '}
                                                        {chatName}
                                                    </h3>
                                                    {chat.lastMessage && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatChatListTime(chat.lastMessage.createdAt)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 min-w-0 flex-1">
                                                        {chat.lastMessage && chat.lastMessage.sender._id === user?._id && (
                                                            <MessageStatus status={chat.lastMessage.status} className="flex-shrink-0" />
                                                        )}
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {getLastMessagePreview(chat)}
                                                        </p>
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <div className="flex-shrink-0 ml-2 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                                                            {unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </ScrollArea>
        </div>
    );
}
