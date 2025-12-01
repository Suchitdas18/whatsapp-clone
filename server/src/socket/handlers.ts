import { Server as SocketIOServer, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import Message, { MessageStatus } from '../models/Message';
import Chat from '../models/Chat';

// Store online users
const onlineUsers = new Map<string, string>(); // userId -> socketId

export const setupSocketHandlers = (io: SocketIOServer): void => {
    // Authentication middleware
    io.use(async (socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const secret = process.env.JWT_SECRET || 'default-secret-key-change-this';
            const decoded = jwt.verify(token, secret) as {
                id: string;
            };

            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            (socket as any).userId = user._id.toString();
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const userId = (socket as any).userId;
        console.log(`✅ User connected: ${userId}`);

        // User connected
        handleUserConnected(socket, userId, io);

        // Join chat room
        socket.on('join_chat', (chatId: string) => {
            handleJoinChat(socket, chatId);
        });

        // Leave chat room
        socket.on('leave_chat', (chatId: string) => {
            handleLeaveChat(socket, chatId);
        });

        // Send message
        socket.on('send_message', async (data) => {
            await handleSendMessage(socket, data, io);
        });

        // Typing indicator
        socket.on('typing', (data: { chatId: string; isTyping: boolean }) => {
            handleTyping(socket, data, io);
        });

        // Message delivered
        socket.on('message_delivered', async (data: { messageId: string }) => {
            await handleMessageDelivered(socket, data, io);
        });

        // Message seen
        socket.on('message_seen', async (data: { messageId: string; chatId: string }) => {
            await handleMessageSeen(socket, data, io, userId);
        });

        // Mark chat as read
        socket.on('mark_chat_read', async (data: { chatId: string }) => {
            await handleMarkChatRead(socket, data, io, userId);
        });

        // Video call events
        socket.on('video_call_request', async (data: { chatId: string; callerId: string; callerName: string; callerAvatar?: string }) => {
            try {
                // Get chat participants
                const chat = await Chat.findById(data.chatId).populate('participants', '_id');
                if (!chat) return;

                // Send to all participants except caller
                chat.participants.forEach((participant: any) => {
                    const participantId = participant._id.toString();
                    if (participantId !== data.callerId) {
                        const recipientSocketId = onlineUsers.get(participantId);
                        if (recipientSocketId) {
                            io.to(recipientSocketId).emit('video_call_request', data);
                        }
                    }
                });

                // Also send to chat room for those who have it open
                socket.to(data.chatId).emit('video_call_request', data);
            } catch (error) {
                console.error('Error handling video call request:', error);
            }
        });

        socket.on('video_call_offer', (data: { chatId: string; offer: any }) => {
            socket.to(data.chatId).emit('video_call_offer', data);
        });

        socket.on('video_call_answer', (data: { chatId: string; answer: any }) => {
            socket.to(data.chatId).emit('video_call_answer', data);
        });

        socket.on('video_call_ice_candidate', (data: { chatId: string; candidate: any }) => {
            socket.to(data.chatId).emit('video_call_ice_candidate', data);
        });

        socket.on('video_call_rejected', (data: { chatId: string }) => {
            socket.to(data.chatId).emit('video_call_rejected');
        });

        socket.on('video_call_end', (data: { chatId: string }) => {
            socket.to(data.chatId).emit('video_call_ended');
        });

        // Disconnect
        socket.on('disconnect', () => {
            handleUserDisconnected(socket, userId, io);
        });
    });
};

/**
 * Handle user connected
 */
const handleUserConnected = async (
    socket: Socket,
    userId: string,
    io: SocketIOServer
): Promise<void> => {
    try {
        // Update user status
        await User.findByIdAndUpdate(userId, {
            isOnline: true,
            socketId: socket.id,
        });

        onlineUsers.set(userId, socket.id);

        // Notify all users about online status
        io.emit('user_online', { userId, isOnline: true });
    } catch (error) {
        console.error('Error in handleUserConnected:', error);
    }
};

/**
 * Handle user disconnected
 */
const handleUserDisconnected = async (
    socket: Socket,
    userId: string,
    io: SocketIOServer
): Promise<void> => {
    try {
        console.log(`❌ User disconnected: ${userId}`);

        // Update user status
        await User.findByIdAndUpdate(userId, {
            isOnline: false,
            lastSeen: new Date(),
            socketId: '',
        });

        onlineUsers.delete(userId);

        // Notify all users about offline status
        io.emit('user_offline', { userId, isOnline: false, lastSeen: new Date() });
    } catch (error) {
        console.error('Error in handleUserDisconnected:', error);
    }
};

/**
 * Handle join chat
 */
const handleJoinChat = (socket: Socket, chatId: string): void => {
    socket.join(chatId);
    console.log(`User ${(socket as any).userId} joined chat: ${chatId}`);
};

/**
 * Handle leave chat
 */
const handleLeaveChat = (socket: Socket, chatId: string): void => {
    socket.leave(chatId);
    console.log(`User ${(socket as any).userId} left chat: ${chatId}`);
};

/**
 * Handle send message
 */
const handleSendMessage = async (
    socket: Socket,
    data: any,
    io: SocketIOServer
): Promise<void> => {
    try {
        const { chatId, message } = data;

        // Populate message with sender info
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .populate('replyTo');

        // Send to all users in the chat room
        io.to(chatId).emit('new_message', populatedMessage);

        // Send delivery notification to sender
        socket.emit('message_sent', {
            tempId: data.tempId,
            message: populatedMessage,
        });
    } catch (error) {
        console.error('Error in handleSendMessage:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
    }
};

/**
 * Handle typing indicator
 */
const handleTyping = (
    socket: Socket,
    data: { chatId: string; isTyping: boolean },
    io: SocketIOServer
): void => {
    const userId = (socket as any).userId;
    socket.to(data.chatId).emit('user_typing', {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
    });
};

/**
 * Handle message delivered
 */
const handleMessageDelivered = async (
    socket: Socket,
    data: { messageId: string },
    io: SocketIOServer
): Promise<void> => {
    try {
        const message = await Message.findByIdAndUpdate(
            data.messageId,
            { status: MessageStatus.DELIVERED },
            { new: true }
        );

        if (message) {
            io.to(message.chat.toString()).emit('message_status_updated', {
                messageId: message._id,
                status: MessageStatus.DELIVERED,
            });
        }
    } catch (error) {
        console.error('Error in handleMessageDelivered:', error);
    }
};

/**
 * Handle message seen
 */
const handleMessageSeen = async (
    socket: Socket,
    data: { messageId: string; chatId: string },
    io: SocketIOServer,
    userId: string
): Promise<void> => {
    try {
        const message = await Message.findById(data.messageId);

        if (message) {
            // Update status to seen
            message.status = MessageStatus.SEEN;

            // Add to readBy if not already present
            const alreadyRead = message.readBy.some(
                (r) => r.user.toString() === userId
            );

            if (!alreadyRead) {
                message.readBy.push({
                    user: userId as any,
                    readAt: new Date(),
                });
            }

            await message.save();

            // Notify all users in chat
            io.to(data.chatId).emit('message_status_updated', {
                messageId: message._id,
                status: MessageStatus.SEEN,
                readBy: message.readBy,
            });
        }
    } catch (error) {
        console.error('Error in handleMessageSeen:', error);
    }
};

/**
 * Handle mark entire chat as read
 */
const handleMarkChatRead = async (
    socket: Socket,
    data: { chatId: string },
    io: SocketIOServer,
    userId: string
): Promise<void> => {
    try {
        // Find all unread messages in chat where user is not the sender
        const messages = await Message.find({
            chat: data.chatId,
            sender: { $ne: userId },
            'readBy.user': { $ne: userId },
        });

        // Update all messages
        for (const message of messages) {
            message.status = MessageStatus.SEEN;
            message.readBy.push({
                user: userId as any,
                readAt: new Date(),
            });
            await message.save();

            // Notify others
            socket.to(data.chatId).emit('message_status_updated', {
                messageId: message._id,
                status: MessageStatus.SEEN,
                readBy: message.readBy,
            });
        }
    } catch (error) {
        console.error('Error in handleMarkChatRead:', error);
    }
};

export default setupSocketHandlers;
