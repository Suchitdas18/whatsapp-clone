'use client';

import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';

export function DarkModeToggle() {
    const { isDarkMode, toggleDarkMode } = useUIStore();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
                <Moon className="h-5 w-5 text-slate-700" />
            )}
        </Button>
    );
}
