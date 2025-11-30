import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusProps {
    status: 'sent' | 'delivered' | 'seen';
    className?: string;
}

export function MessageStatus({ status, className = '' }: MessageStatusProps) {
    if (status === 'sent') {
        return <Check className={`w-4 h-4 text-gray-400 ${className}`} />;
    }

    if (status === 'delivered') {
        return (
            <CheckCheck className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${className}`} />
        );
    }

    // Seen - blue checkmarks
    return <CheckCheck className={`w-4 h-4 text-blue-500 ${className}`} />;
}
