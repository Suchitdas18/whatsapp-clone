import { create } from 'zustand';

export interface Message {
    _id: string;
    chat: string;
    sender: {
        _id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    encryptedContent?: string;
    type: 'text' | 'image' | 'video' | 'document' | 'audio';
    status: 'sent' | 'delivered' | 'seen';
    readBy: Array<{
        user: string;
        readAt: Date;
    }>;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: any;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Chat {
    _id: string;
    participants: Array<{
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        isOnline: boolean;
        lastSeen: Date;
    }>;
    isGroupChat: boolean;
    groupName?: string;
    groupAvatar?: string;
    groupAdmin?: string;
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
}

interface ChatState {
    chats: Chat[];
    currentChat: Chat | null;
    messages: Map<string, Message[]>;
    typingUsers: Map<string, Set<string>>;
    setChats: (chats: Chat[]) => void;
    addChat: (chat: Chat) => void;
    updateChat: (chatId: string, updates: Partial<Chat>) => void;
    setCurrentChat: (chat: Chat | null) => void;
    setMessages: (chatId: string, messages: Message[]) => void;
    addMessage: (chatId: string, message: Message) => void;
    updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
    deleteMessage: (chatId: string, messageId: string) => void;
    setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    chats: [],
    currentChat: null,
    messages: new Map(),
    typingUsers: new Map(),

    setChats: (chats) => set({ chats }),

    addChat: (chat) =>
        set((state) => ({
            chats: [chat, ...state.chats],
        })),

    updateChat: (chatId, updates) =>
        set((state) => ({
            chats: state.chats.map((chat) =>
                chat._id === chatId ? { ...chat, ...updates } : chat
            ),
            currentChat:
                state.currentChat?._id === chatId
                    ? { ...state.currentChat, ...updates }
                    : state.currentChat,
        })),

    setCurrentChat: (chat) => set({ currentChat: chat }),

    setMessages: (chatId, messages) =>
        set((state) => {
            const newMessages = new Map(state.messages);
            newMessages.set(chatId, messages);
            return { messages: newMessages };
        }),

    addMessage: (chatId, message) =>
        set((state) => {
            const newMessages = new Map(state.messages);
            const chatMessages = newMessages.get(chatId) || [];
            newMessages.set(chatId, [...chatMessages, message]);
            return { messages: newMessages };
        }),

    updateMessage: (chatId, messageId, updates) =>
        set((state) => {
            const newMessages = new Map(state.messages);
            const chatMessages = newMessages.get(chatId) || [];
            newMessages.set(
                chatId,
                chatMessages.map((msg) =>
                    msg._id === messageId ? { ...msg, ...updates } : msg
                )
            );
            return { messages: newMessages };
        }),

    deleteMessage: (chatId, messageId) =>
        set((state) => {
            const newMessages = new Map(state.messages);
            const chatMessages = newMessages.get(chatId) || [];
            newMessages.set(
                chatId,
                chatMessages.filter((msg) => msg._id !== messageId)
            );
            return { messages: newMessages };
        }),

    setTyping: (chatId, userId, isTyping) =>
        set((state) => {
            const newTypingUsers = new Map(state.typingUsers);
            const chatTypingUsers = newTypingUsers.get(chatId) || new Set();

            if (isTyping) {
                chatTypingUsers.add(userId);
            } else {
                chatTypingUsers.delete(userId);
            }

            newTypingUsers.set(chatId, chatTypingUsers);
            return { typingUsers: newTypingUsers };
        }),

    clearChat: () =>
        set({
            chats: [],
            currentChat: null,
            messages: new Map(),
            typingUsers: new Map(),
        }),
}));
