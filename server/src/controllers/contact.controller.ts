import { Response } from 'express';
import User from '../models/User';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * @desc    Find users by email or phone
 * @route   POST /api/contacts/search
 * @access  Private
 */
export const searchContacts = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { query } = req.body;
        const userId = req.user?._id;

        if (!query) {
            res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
            return;
        }

        // Search by email or phone
        const users = await User.find({
            $and: [
                { _id: { $ne: userId } }, // Exclude current user
                {
                    $or: [
                        { email: { $regex: query, $options: 'i' } },
                        { phone: { $regex: query, $options: 'i' } },
                        { name: { $regex: query, $options: 'i' } },
                    ],
                },
            ],
        })
            .select('name email phone avatar bio isOnline lastSeen')
            .limit(20);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error: any) {
        console.error('Error searching contacts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to search contacts',
        });
    }
};

/**
 * @desc    Find contacts by phone numbers (batch)
 * @route   POST /api/contacts/find-by-phones
 * @access  Private
 */
export const findByPhones = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { phones } = req.body;
        const userId = req.user?._id;

        if (!phones || !Array.isArray(phones)) {
            res.status(400).json({
                success: false,
                message: 'Phone numbers array is required',
            });
            return;
        }

        // Find users with these phone numbers
        const users = await User.find({
            phone: { $in: phones },
            _id: { $ne: userId },
        }).select('name email phone avatar bio isOnline lastSeen');

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error: any) {
        console.error('Error finding contacts by phones:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to find contacts',
        });
    }
};

/**
 * @desc    Start chat with a user
 * @route   POST /api/contacts/start-chat
 * @access  Private
 */
export const startChat = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { participantId } = req.body;
        const userId = req.user?._id;

        if (!participantId) {
            res.status(400).json({
                success: false,
                message: 'Participant ID is required',
            });
            return;
        }

        // Check if participant exists
        const participant = await User.findById(participantId);
        if (!participant) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [userId, participantId] },
        })
            .populate('participants', 'name email phone avatar bio isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'name avatar' },
            });

        if (existingChat) {
            res.status(200).json({
                success: true,
                chat: existingChat,
            });
            return;
        }

        // Create new chat
        const chat = await Chat.create({
            participants: [userId, participantId],
            isGroup: false,
        });

        const populatedChat = await Chat.findById(chat._id)
            .populate('participants', 'name email phone avatar bio isOnline lastSeen')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'name avatar' },
            });

        res.status(201).json({
            success: true,
            chat: populatedChat,
        });
    } catch (error: any) {
        console.error('Error starting chat:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to start chat',
        });
    }
};
