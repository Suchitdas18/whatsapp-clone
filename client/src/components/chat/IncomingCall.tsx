'use client';

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
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-8 max-w-md w-full text-center shadow-2xl">
                {/* Caller Avatar */}
                <div className="mb-6 flex justify-center">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                        <AvatarImage src={callerAvatar} alt={callerName} />
                        <AvatarFallback className="text-2xl">{getInitials(callerName)}</AvatarFallback>
                    </Avatar>
                </div>

                {/* Caller Info */}
                <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
                <p className="text-muted-foreground mb-8">Incoming video call...</p>

                {/* Ringing Animation */}
                <div className="mb-8 flex justify-center">
                    <div className="animate-pulse">
                        <Video className="h-12 w-12 text-primary" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button
                        variant="destructive"
                        size="lg"
                        className="rounded-full w-16 h-16"
                        onClick={onReject}
                    >
                        <PhoneOff className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="default"
                        size="lg"
                        className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
                        onClick={onAccept}
                    >
                        <Video className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
