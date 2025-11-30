import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    isDarkMode: boolean;
    isSidebarOpen: boolean;
    toggleDarkMode: () => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isDarkMode: false,
            isSidebarOpen: true,

            toggleDarkMode: () =>
                set((state) => {
                    const newMode = !state.isDarkMode;
                    if (newMode) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { isDarkMode: newMode };
                }),

            toggleSidebar: () =>
                set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

            setSidebarOpen: (open) => set({ isSidebarOpen: open }),
        }),
        {
            name: 'ui-storage',
            onRehydrateStorage: () => (state) => {
                // Apply dark mode on rehydration
                if (state?.isDarkMode) {
                    document.documentElement.classList.add('dark');
                }
            },
        }
    )
);
