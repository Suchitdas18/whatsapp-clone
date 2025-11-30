import { Response } from 'express';
import Message, { MessageStatus, MessageType } from '../models/Message';
import Chat from '../models/Chat';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudinaryService from '../services/cloudinary.service';

/**
 * @desc    Send message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { chatId, content, type, encryptedContent, replyTo } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        if (!chatId) {
            res.status(400).json({
                success: false,
                message: 'Chat ID is required',
            });
            return;
        }

        // Verify chat exists and user is participant
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
            return;
        }

        if (!chat.participants.includes(currentUserId as any)) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to send message in this chat',
            });
            return;
        }

        // Create message
        let message = await Message.create({
            chat: chatId,
            sender: currentUserId,
            content: content || '',
            encryptedContent,
            type: type || MessageType.TEXT,
            replyTo,
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar')
            .populate('replyTo');

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: populatedMessage,
        });
    } catch (error: any) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Get messages for a chat
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
export const getMessages = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        // Verify chat exists and user is participant
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
            return;
        }

        if (!chat.participants.includes(currentUserId as any)) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view messages in this chat',
            });
            return;
        }

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const messages = await Message.find({
            chat: chatId,
            deletedFor: { $ne: currentUserId },
        })
            .populate('sender', 'name avatar')
            .populate({
                path: 'replyTo',
                populate: {
                    path: 'sender',
                    select: 'name avatar',
                },
            })
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip(skip);

        const total = await Message.countDocuments({
            chat: chatId,
            deletedFor: { $ne: currentUserId },
        });

        res.status(200).json({
            success: true,
            count: messages.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: messages.reverse(),
        });
    } catch (error: any) {
        console.error('Error in getMessages:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Upload file message
 * @route   POST /api/messages/upload
 * @access  Private
 */
export const uploadFileMessage = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { chatId, encryptedContent } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;
        const file = req.file;

        if (!file) {
            res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
            return;
        }

        // Verify chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
            return;
        }

        if (!chat.participants.includes(currentUserId as any)) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to send message in this chat',
            });
            return;
        }

        // Determine message type
        let messageType = MessageType.DOCUMENT;
        let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';

        if (file.mimetype.startsWith('image/')) {
            messageType = MessageType.IMAGE;
            resourceType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            messageType = MessageType.VIDEO;
            resourceType = 'video';
        } else if (file.mimetype.startsWith('audio/')) {
            messageType = MessageType.AUDIO;
        }

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadFile(
            file.buffer,
            `whatsapp-clone/${messageType}s`,
            resourceType
        );

        // Create message
        let message = await Message.create({
            chat: chatId,
            sender: currentUserId,
            type: messageType,
            fileUrl: result.url,
            fileName: file.originalname,
            fileSize: file.size,
            encryptedContent,
            content: `Sent a ${messageType}`,
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            data: populatedMessage,
        });
    } catch (error: any) {
        console.error('Error in uploadFileMessage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Update message status
 * @route   PUT /api/messages/:id/status
 * @access  Private
 */
export const updateMessageStatus = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }

        // Update status
        if (status) {
            message.status = status;
        }

        // Add to readBy if status is seen
        if (status === MessageStatus.SEEN) {
            const alreadyRead = message.readBy.some(
                (r) => r.user.toString() === currentUserId.toString()
            );
            if (!alreadyRead) {
                message.readBy.push({
                    user: currentUserId as any,
                    readAt: new Date(),
                });
            }
        }

        await message.save();

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error: any) {
        console.error('Error in updateMessageStatus:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Edit message
 * @route   PUT /api/messages/:id
 * @access  Private
 */
export const editMessage = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { content, encryptedContent } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }

        if (message.sender.toString() !== currentUserId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to edit this message',
            });
            return;
        }

        message.content = content;
        if (encryptedContent) message.encryptedContent = encryptedContent;
        message.isEdited = true;
        await message.save();

        res.status(200).json({
            success: true,
            message: 'Message updated successfully',
            data: message,
        });
    } catch (error: any) {
        console.error('Error in editMessage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
export const deleteMessage = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { deleteForEveryone } = req.body;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found',
            });
            return;
        }

        if (message.sender.toString() !== currentUserId.toString()) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message',
            });
            return;
        }

        if (deleteForEveryone) {
            // Delete for everyone
            message.isDeleted = true;
            message.content = 'This message was deleted';
            await message.save();
        } else {
            // Delete for self only
            if (!message.deletedFor.includes(currentUserId as any)) {
                message.deletedFor.push(currentUserId as any);
                await message.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error: any) {
        console.error('Error in deleteMessage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Search messages
 * @route   GET /api/messages/search/:chatId
 * @access  Private
 */
export const searchMessages = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { query } = req.query;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        if (!query) {
            res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
            return;
        }

        // Verify chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(currentUserId as any)) {
            res.status(403).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }

        const messages = await Message.find({
            chat: chatId,
            content: { $regex: query, $options: 'i' },
            isDeleted: false,
            deletedFor: { $ne: currentUserId },
        })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (error: any) {
        console.error('Error in searchMessages:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};
