import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudinaryService from '../services/cloudinary.service';

/**
 * @desc    Get all users (search)
 * @route   GET /api/users
 * @access  Private
 */
export const getUsers = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { search } = req.query;

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }
        const currentUserId = req.user._id;

        let query: any = { _id: { $ne: currentUserId } };

        if (search) {
            query = {
                ...query,
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            };
        }

        const users = await User.find(query)
            .select('name email avatar bio isOnline lastSeen')
            .limit(50);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error: any) {
        console.error('Error in getUsers:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select(
            'name email avatar bio isOnline lastSeen publicKey'
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('Error in getUserById:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user;
        const { name, bio } = req.body;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }

        // Update fields
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error: any) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Upload avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
export const uploadAvatar = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user;
        const file = req.file;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }

        if (!file) {
            res.status(400).json({
                success: false,
                message: 'Please upload a file',
            });
            return;
        }

        // Upload to Cloudinary
        const result = await cloudinaryService.uploadFile(
            file.buffer,
            'whatsapp-clone/avatars',
            'image'
        );

        // Update user avatar
        user.avatar = result.url;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                avatar: result.url,
            },
        });
    } catch (error: any) {
        console.error('Error in uploadAvatar:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};
