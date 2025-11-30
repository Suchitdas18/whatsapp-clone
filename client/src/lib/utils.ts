import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format timestamp for chat list (e.g., "2:30 PM", "Yesterday", "12/25/23")
 */
export function formatChatListTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isToday(dateObj)) {
        return format(dateObj, 'p'); // 2:30 PM
    } else if (isYesterday(dateObj)) {
        return 'Yesterday';
    } else {
        return format(dateObj, 'M/d/yy'); // 12/25/23
    }
}

/**
 * Format timestamp for messages (e.g., "2:30 PM")
 */
export function formatMessageTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'p'); // 2:30 PM
}

/**
 * Format last seen time
 */
export function formatLastSeen(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Generate random color for avatar
 */
export function getAvatarColor(name: string): string {
    const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Get chat name (for 1-1 chats, get other user's name)
 */
export function getChatName(chat: any, currentUserId: string): string {
    if (chat.isGroupChat) {
        return chat.groupName || 'Group Chat';
    }

    const otherUser = chat.participants?.find(
        (p: any) => p._id !== currentUserId
    );
    return otherUser?.name || 'Unknown User';
}

/**
 * Get chat avatar (for 1-1 chats, get other user's avatar)
 */
export function getChatAvatar(chat: any, currentUserId: string): string {
    if (chat.isGroupChat) {
        return chat.groupAvatar || '';
    }

    const otherUser = chat.participants?.find(
        (p: any) => p._id !== currentUserId
    );
    return otherUser?.avatar || '';
}

/**
 * Get online status for chat
 */
export function getChatOnlineStatus(chat: any, currentUserId: string): boolean {
    if (chat.isGroupChat) return false;

    const otherUser = chat.participants?.find(
        (p: any) => p._id !== currentUserId
    );
    return otherUser?.isOnline || false;
}
