import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    bio?: string;
    publicKey: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (updatedData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...updatedData } : null,
                })),
        }),
        {
            name: 'auth-storage',
        }
    )
);
