'use client';

import { useAuthStore } from '@/store/authStore';
import { useChatStore, Message } from '@/store/chatStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageStatus } from './MessageStatus';
import { formatMessageTime, getInitials } from '@/lib/utils';
import { FileText, Film, Image as ImageIcon, Music } from 'lucide-react';
import Image from 'next/image';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const { user: currentUser } = useAuthStore();
    const isSent = message.sender._id === currentUser?._id;

    const renderFilePreview = () => {
        switch (message.type) {
            case 'image':
                return (
                    <div className="mb-2 rounded-lg overflow-hidden max-w-sm">
                        <Image
                            src={message.fileUrl || ''}
                            alt={message.fileName || 'Image'}
                            width={300}
                            height={300}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                );
            case 'video':
                return (
                    <div className="mb-2 flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                        <Film className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName}</p>
                            <p className="text-xs text-muted-foreground">Video</p>
                        </div>
                    </div>
                );
            case 'document':
                return (
                    <div className="mb-2 flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                        <FileText className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName}</p>
                            <p className="text-xs text-muted-foreground">Document</p>
                        </div>
                    </div>
                );
            case 'audio':
                return (
                    <div className="mb-2 flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                        <Music className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{message.fileName}</p>
                            <p className="text-xs text-muted-foreground">Audio</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`flex gap-2 mb-4 message-enter ${isSent ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            {/* Avatar - only show for received messages */}
            {!isSent && (
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                    <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                </Avatar>
            )}

            {/* Message Bubble */}
            <div
                className={`max-w-[70%] md:max-w-md ${isSent ? 'items-end' : 'items-start'
                    }`}
            >
                {/* Sender name for group chats (received messages only) */}
                {!isSent && (
                    <p className="text-xs text-muted-foreground mb-1 px-1">
                        {message.sender.name}
                    </p>
                )}

                {/* Message content */}
                <div
                    className={`rounded-lg px-4 py-2 ${isSent
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                >
                    {/* Reply reference */}
                    {message.replyTo && (
                        <div className="mb-2 pb-2 border-l-4 border-primary/50 pl-3 bg-black/10 dark:bg-white/10 rounded p-2">
                            <p className="text-xs opacity-80 font-medium">
                                {message.replyTo.sender?.name}
                            </p>
                            <p className="text-xs opacity-70 truncate">
                                {message.replyTo.content}
                            </p>
                        </div>
                    )}

                    {/* File preview */}
                    {message.type !== 'text' && renderFilePreview()}

                    {/* Text content */}
                    {message.content && !message.isDeleted && (
                        <p className="text-sm break-words whitespace-pre-wrap">
                            {message.content}
                        </p>
                    )}

                    {/* Deleted message */}
                    {message.isDeleted && (
                        <p className="text-sm italic opacity-60">
                            This message was deleted
                        </p>
                    )}

                    {/* Timestamp and status */}
                    <div className="flex items-center justify-end gap-1 mt-1">
                        {message.isEdited && (
                            <span className="text-xs opacity-60">edited</span>
                        )}
                        <span className="text-xs opacity-70">
                            {formatMessageTime(message.createdAt)}
                        </span>
                        {isSent && <MessageStatus status={message.status} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
