import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import OTP from '../models/OTP';
import { AuthRequest } from '../middleware/auth.middleware';
import encryptionService from '../services/encryption.service';

// Generate JWT Token
const generateToken = (id: string): string => {
    const secret: jwt.Secret = process.env.JWT_SECRET || 'default-secret-key-change-this';
    const expiresIn = process.env.JWT_EXPIRE || '7d';
    return jwt.sign({ id }, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password, avatar, bio } = req.body;

        // Validate input
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }

        // Check if OTP was verified
        const verifiedOTP = await OTP.findOne({
            email,
            type: 'email',
            verified: true,
            expiresAt: { $gt: new Date() },
        });

        if (!verifiedOTP) {
            res.status(400).json({
                success: false,
                message: 'Please verify your email first',
            });
            return;
        }

        // Generate encryption keys
        const { publicKey, privateKey } = encryptionService.generateKeyPair();

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            avatar,
            bio,
            publicKey,
            privateKey,
            emailVerified: true,
        });

        // Delete verified OTP
        await OTP.deleteOne({ _id: verifiedOTP._id });

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    publicKey: user.publicKey,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error('Error in register:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
            return;
        }

        // Check if user exists and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }

        // Update online status
        user.isOnline = true;
        await user.save();

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    bio: user.bio,
                    publicKey: user.publicKey,
                    isOnline: user.isOnline,
                    lastSeen: user.lastSeen,
                },
                token,
            },
        });
    } catch (error: any) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        console.error('Error in getMe:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const user = req.user;

        if (user) {
            user.isOnline = false;
            user.lastSeen = new Date();
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error: any) {
        console.error('Error in logout:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
        });
    }
};
