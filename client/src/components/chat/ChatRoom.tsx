'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    MoreVertical,
    Search,
    Phone,
    Video,
    Loader2
} from 'lucide-react';
import api from '@/lib/api';
import socketService from '@/lib/socket';
import {
    getChatName,
    getChatAvatar,
    getChatOnlineStatus,
    getInitials,
    formatLastSeen
} from '@/lib/utils';
import { useState } from 'react';
import { VideoCall } from './VideoCall';
import { IncomingCall } from './IncomingCall';

export function ChatRoom() {
    const { user } = useAuthStore();
    const { currentChat, messages, setMessages, addMessage, updateMessage, setTyping } = useChatStore();
    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ chatId: string; callerId: string; callerName: string; callerAvatar?: string } | null>(null);
    const [isCallInitiator, setIsCallInitiator] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const chatId = currentChat?._id;
    const chatMessages = chatId ? messages.get(chatId) || [] : [];

    // Fetch messages when chat changes
    useEffect(() => {
        if (!chatId) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/messages/${chatId}`);
                if (response.data.success) {
                    setMessages(chatId, response.data.data);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Join chat room via socket
        socketService.joinChat(chatId);

        return () => {
            socketService.leaveChat(chatId);
        };
    }, [chatId]);

    // Setup socket listeners
    useEffect(() => {
        if (!chatId) return;

        // New message received
        const handleNewMessage = (message: any) => {
            if (message.chat === chatId) {
                addMessage(chatId, message);
                scrollToBottom();

                // Mark as delivered if not sent by current user
                if (message.sender._id !== user?._id) {
                    socketService.messageDelivered(message._id);

                    // Show notification
                    if (typeof window !== 'undefined' && document.hidden) {
                        const { showMessageNotification } = require('@/lib/notifications');
                        showMessageNotification(
                            message.sender.name,
                            message.content || 'Sent a file',
                            message.sender.avatar
                        );
                    }

                    // Auto-mark as seen after a short delay
                    setTimeout(() => {
                        socketService.messageSeen(message._id, chatId);
                    }, 1000);
                }
            }
        };

        // Message status updated
        const handleStatusUpdate = (data: any) => {
            if (data.messageId) {
                updateMessage(chatId, data.messageId, {
                    status: data.status,
                    readBy: data.readBy
                });
            }
        };

        // Typing indicator
        const handleTyping = (data: { userId: string; chatId: string; isTyping: boolean }) => {
            if (data.chatId === chatId && data.userId !== user?._id) {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    if (data.isTyping) {
                        next.add(data.userId);
                    } else {
                        next.delete(data.userId);
                    }
                    return next;
                });
            }
        };

        socketService.on('new_message', handleNewMessage);
        socketService.on('message_status_updated', handleStatusUpdate);
        socketService.on('user_typing', handleTyping);

        return () => {
            socketService.off('new_message', handleNewMessage);
            socketService.off('message_status_updated', handleStatusUpdate);
            socketService.off('user_typing', handleTyping);
        };
    }, [chatId, user?._id]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [chatMessages.length]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    // Video call functions
    const startVideoCall = () => {
        if (!chatId) return;

        setIsCallInitiator(true);
        setIsInCall(true);

        // Notify other user
        socketService.emit('video_call_request', {
            chatId,
            callerId: user?._id,
            callerName: user?.name,
            callerAvatar: user?.avatar,
        });
    };

    const acceptCall = () => {
        setIncomingCall(null);
        setIsCallInitiator(false);
        setIsInCall(true);
    };

    const rejectCall = () => {
        if (incomingCall) {
            socketService.emit('video_call_rejected', {
                chatId: incomingCall.chatId,
            });
        }
        setIncomingCall(null);
    };

    const endCall = () => {
        setIsInCall(false);
        setIsCallInitiator(false);
    };

    // Setup video call listeners
    useEffect(() => {
        const handleIncomingCall = (data: { chatId: string; callerId: string; callerName: string; callerAvatar?: string }) => {
            setIncomingCall(data);

            // Show notification
            if (typeof window !== 'undefined') {
                const { showCallNotification } = require('@/lib/notifications');
                showCallNotification(data.callerName, true, data.callerAvatar);
            }
        };

        const handleCallRejected = () => {
            setIsInCall(false);
            setIsCallInitiator(false);
            alert('Call rejected');
        };

        socketService.on('video_call_request', handleIncomingCall);
        socketService.on('video_call_rejected', handleCallRejected);

        return () => {
            socketService.off('video_call_request', handleIncomingCall);
            socketService.off('video_call_rejected', handleCallRejected);
        };
    }, []);

    if (!currentChat) {
        return (
            <div className="flex-1 flex items-center justify-center bg-secondary/20">
                <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Select a chat to start messaging
                    </h3>
                    <p className="text-muted-foreground">
                        Choose a conversation from the sidebar
                    </p>
                </div>
            </div>
        );
    }

    const chatName = getChatName(currentChat, user?._id || '');
    const chatAvatar = getChatAvatar(currentChat, user?._id || '');
    const isOnline = getChatOnlineStatus(currentChat, user?._id || '');

    // Get other user for last seen (in 1-1 chats)
    const otherUser = !currentChat.isGroupChat
        ? currentChat.participants?.find(p => p._id !== user?._id)
        : null;

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="whatsapp-header border-b border-border/20 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={chatAvatar} alt={chatName} />
                            <AvatarFallback>{getInitials(chatName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-white">{chatName}</h2>
                            <p className="text-xs text-white/80">
                                {typingUsers.size > 0 ? (
                                    <span className="text-green-300">typing...</span>
                                ) : isOnline ? (
                                    'Online'
                                ) : otherUser?.lastSeen ? (
                                    `Last seen ${formatLastSeen(otherUser.lastSeen)}`
                                ) : (
                                    'Offline'
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <Search className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <Phone className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={startVideoCall}>
                            <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto bg-[url('/chat-bg-light.png')] dark:bg-[url('/chat-bg-dark.png')] bg-secondary/10 p-4"
            >
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-4xl mb-2">👋</div>
                            <p className="text-muted-foreground">
                                No messages yet. Start the conversation!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {chatMessages.map((message) => (
                            <MessageBubble key={message._id} message={message} />
                        ))}
                    </div>
                )}

                {/* Typing indicator */}
                {typingUsers.size > 0 && (
                    <div className="flex gap-2 mb-4">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={chatAvatar} alt={chatName} />
                            <AvatarFallback>{getInitials(chatName)}</AvatarFallback>
                        </Avatar>
                        <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                                <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                                <div className="w-2 h-2 bg-current rounded-full typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Message Input */}
            <MessageInput chatId={chatId!} onMessageSent={scrollToBottom} />

            {/* Video Call UI */}
            {isInCall && chatId && (
                <VideoCall
                    chatId={chatId}
                    callerId={user?._id || ''}
                    isInitiator={isCallInitiator}
                    onCallEnd={endCall}
                />
            )}

            {/* Incoming Call Notification */}
            {incomingCall && (
                <IncomingCall
                    callerName={incomingCall.callerName}
                    callerAvatar={incomingCall.callerAvatar}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            )}
        </div>
    );
}
