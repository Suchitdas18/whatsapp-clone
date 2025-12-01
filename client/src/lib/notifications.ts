// Generate notification sounds using Web Audio API
const playBeep = (frequency: number, duration: number, volume: number = 0.3) => {
    if (typeof window === 'undefined') return;

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.value = volume;

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
        console.error('Error playing beep:', error);
    }
};

// Play notification sound
export const playSound = (soundType: 'message' | 'call') => {
    if (soundType === 'message') {
        // Short, pleasant notification tone
        playBeep(800, 0.1, 0.2);
        setTimeout(() => playBeep(1000, 0.1, 0.15), 100);
    } else {
        // Longer ringing tone
        playBeep(800, 0.3, 0.3);
        setTimeout(() => playBeep(1000, 0.3, 0.3), 400);
        setTimeout(() => playBeep(800, 0.3, 0.3), 800);
    }
};

// Request notification permission
export const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

// Show desktop notification
export const showNotification = (title: string, options?: NotificationOptions) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        try {
            const notification = new Notification(title, {
                icon: '/icon-192x192.png',
                badge: '/icon-96x96.png',
                ...options,
            });

            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
};

// Show new message notification
export const showMessageNotification = (senderName: string, message: string, avatar?: string) => {
    playSound('message');

    showNotification(`New message from ${senderName}`, {
        body: message,
        icon: avatar || '/icon-192x192.png',
        tag: 'message',
    });
};

// Show incoming call notification
export const showCallNotification = (callerName: string, isVideo: boolean, avatar?: string) => {
    playSound('call');

    showNotification(`Incoming ${isVideo ? 'video' : 'voice'} call`, {
        body: `${callerName} is calling...`,
        icon: avatar || '/icon-192x192.png',
        tag: 'call',
        requireInteraction: true, // Keeps notification until user interacts
    });
};
