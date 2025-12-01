'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import socketService from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface MessageInputProps {
    chatId: string;
    onMessageSent?: () => void;
}

export function MessageInput({ chatId, onMessageSent }: MessageInputProps) {
    const { user } = useAuthStore();
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const handleTyping = (value: string) => {
        setMessage(value);

        // Emit typing indicator
        if (!isTyping && value.length > 0) {
            setIsTyping(true);
            socketService.typing(chatId, true);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 3 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketService.typing(chatId, false);
        }, 3000);
    };

    const handleSend = async () => {
        if (!message.trim() || sending) return;

        const messageText = message.trim();
        setMessage('');
        setSending(true);

        // Stop typing indicator
        if (isTyping) {
            setIsTyping(false);
            socketService.typing(chatId, false);
        }

        try {
            const response = await api.post('/messages', {
                chatId,
                content: messageText,
                type: 'text',
            });

            if (response.data.success) {
                const newMessage = response.data.data;

                // Emit via socket
                socketService.sendMessage({
                    chatId,
                    message: newMessage,
                    tempId: Date.now().toString(),
                });

                onMessageSent?.();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message on error
            setMessage(messageText);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiData: any) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chatId', chatId);

            const response = await api.post('/messages/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const newMessage = response.data.data;

                // Emit via socket
                socketService.sendMessage({
                    chatId,
                    message: newMessage,
                    tempId: Date.now().toString(),
                });

                onMessageSent?.();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="border-t border-border bg-background p-4 relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-lg overflow-hidden">
                    <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width={350}
                        height={400}
                    />
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* File upload button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || sending}
                    className="rounded-full"
                >
                    {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Paperclip className="h-5 w-5" />
                    )}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                />

                {/* Emoji button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={sending || uploading}
                >
                    <Smile className="h-5 w-5" />
                </Button>

                {/* Message input */}
                <div className="flex-1">
                    <Input
                        value={message}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={sending || uploading}
                        className="w-full"
                    />
                </div>

                {/* Send button */}
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || sending || uploading}
                    className="rounded-full"
                    size="icon"
                >
                    {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="h-5 w-5" />
                    )}
                </Button>
            </div>
        </div>
    );
}
