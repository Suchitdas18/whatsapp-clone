import { Response } from 'express';
import Chat from '../models/Chat';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/auth.middleware';
import mongoose from 'mongoose';

/**
 * @desc    Create or get 1-1 chat
 * @route   POST /api/chats
 * @access  Private
 */
export const createOrGetChat = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { userId } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: 'User ID is required',
            });
            return;
        }

        if (userId === currentUserId.toString()) {
            res.status(400).json({
                success: false,
                message: 'Cannot create chat with yourself',
            });
            return;
        }

        // Check if chat already exists
        let chat = await Chat.findOne({
            isGroupChat: false,
            participants: {
                $all: [currentUserId, userId],
                $size: 2,
            },
        })
            .populate('participants', 'name email avatar isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'name avatar',
                },
            });

        if (chat) {
            res.status(200).json({
                success: true,
                data: chat,
            });
            return;
        }

        // Create new chat
        chat = await Chat.create({
            participants: [currentUserId, userId],
            isGroupChat: false,
        });

        chat = await Chat.findById(chat._id)
            .populate('participants', 'name email avatar isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'name avatar',
                },
            });

        res.status(201).json({
            success: true,
            message: 'Chat created successfully',
            data: chat,
        });
    } catch (error: any) {
        console.error('Error in createOrGetChat:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Get all chats for current user
 * @route   GET /api/chats
 * @access  Private
 */
export const getChats = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        const chats = await Chat.find({
            participants: currentUserId,
        })
            .populate('participants', 'name email avatar isOnline lastSeen')
            .populate('groupAdmin', 'name email avatar')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'name avatar',
                },
            })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: chats.length,
            data: chats,
        });
    } catch (error: any) {
        console.error('Error in getChats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Create group chat
 * @route   POST /api/chats/group
 * @access  Private
 */
export const createGroupChat = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, participants } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        if (!name || !participants || participants.length < 1) {
            res.status(400).json({
                success: false,
                message: 'Please provide group name and at least 1 participant',
            });
            return;
        }

        // Add current user to participants
        const allParticipants = [
            currentUserId,
            ...participants.filter((p: string) => p !== currentUserId.toString()),
        ];

        // Create group chat
        let chat = await Chat.create({
            groupName: name,
            participants: allParticipants,
            isGroupChat: true,
            groupAdmin: currentUserId,
        });

        const populatedChat = await Chat.findById(chat._id)
            .populate('participants', 'name email avatar isOnline lastSeen')
            .populate('groupAdmin', 'name email avatar');

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            data: populatedChat,
        });
    } catch (error: any) {
        console.error('Error in createGroupChat:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Update group chat
 * @route   PUT /api/chats/group/:id
 * @access  Private
 */
export const updateGroupChat = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, participants } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        const chat = await Chat.findById(id);

        if (!chat) {
            res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
            return;
        }

        if (!chat.isGroupChat) {
            res.status(400).json({
                success: false,
                message: 'This is not a group chat',
            });
            return;
        }

        if (chat.groupAdmin?.toString() !== currentUserId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Only group admin can update the group',
            });
            return;
        }

        if (name) chat.groupName = name;
        if (participants) chat.participants = participants;

        await chat.save();

        const updatedChat = await Chat.findById(id)
            .populate('participants', 'name email avatar isOnline lastSeen')
            .populate('groupAdmin', 'name email avatar');

        res.status(200).json({
            success: true,
            message: 'Group updated successfully',
            data: updatedChat,
        });
    } catch (error: any) {
        console.error('Error in updateGroupChat:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Delete chat
 * @route   DELETE /api/chats/:id
 * @access  Private
 */
export const deleteChat = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        const chat = await Chat.findById(id);

        if (!chat) {
            res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
            return;
        }

        // Check if user is participant
        if (!chat.participants.includes(currentUserId as any)) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this chat',
            });
            return;
        }

        // Delete all messages in chat
        await Message.deleteMany({ chat: id });

        // Delete chat
        await Chat.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully',
        });
    } catch (error: any) {
        console.error('Error in deleteChat:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};
