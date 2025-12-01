'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PhoneOff, Video } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface IncomingCallProps {
    callerName: string;
    callerAvatar?: string;
    onAccept: () => void;
    onReject: () => void;
}

export function IncomingCall({ callerName, callerAvatar, onAccept, onReject }: IncomingCallProps) {
    const ringingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Start continuous ringing
        const playRing = () => {
            if (typeof window !== 'undefined') {
                const { playSound } = require('@/lib/notifications');
                playSound('call');
            }
        };

        // Play immediately
        playRing();

        // Then play every 2 seconds
        ringingIntervalRef.current = setInterval(playRing, 2000);

        // Cleanup on unmount
        return () => {
            if (ringingIntervalRef.current) {
                clearInterval(ringingIntervalRef.current);
            }
        };
    }, []);

    const handleAccept = () => {
        if (ringingIntervalRef.current) {
            clearInterval(ringingIntervalRef.current);
        }
        onAccept();
    };

    const handleReject = () => {
        if (ringingIntervalRef.current) {
            clearInterval(ringingIntervalRef.current);
        }
        onReject();
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-background rounded-lg p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
                {/* Caller Avatar */}
                <div className="mb-6 flex justify-center">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 animate-pulse">
                        <AvatarImage src={callerAvatar} alt={callerName} />
                        <AvatarFallback className="text-2xl">{getInitials(callerName)}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Caller Info */}
                <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
                <p className="text-muted-foreground mb-8 animate-pulse">Incoming video call...</p>

                {/* Ringing Animation */}
                <div className="mb-8 flex justify-center">
                    <div className="animate-bounce">
                        <Video className="h-12 w-12 text-primary" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="destructive"
                        size="lg"
                        className="rounded-full w-16 h-16 hover:scale-110 transition-transform"
                        onClick={handleReject}
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="default"
                        size="lg"
                        className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700 hover:scale-110 transition-transform animate-pulse"
                        onClick={handleAccept}
                    >
                        <Video className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
