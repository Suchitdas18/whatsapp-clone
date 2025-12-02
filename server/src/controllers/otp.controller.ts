import { Response } from 'express';
import OTP from '../models/OTP';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendOTPEmail, sendPhoneOTP } from '../services/email.service';

// Generate 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Send OTP for email verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email, phone, type } = req.body;

        if (type === 'email' && !email) {
            res.status(400).json({
                success: false,
                message: 'Email is required',
            });
            return;
        }

        if (type === 'phone' && !phone) {
            res.status(400).json({
                success: false,
                message: 'Phone number is required',
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne(
            type === 'email' ? { email } : { phone }
        );

        if (existingUser && type === 'email' && existingUser.emailVerified) {
            res.status(400).json({
                success: false,
                message: 'This email is already registered and verified',
            });
            return;
        }

        if (existingUser && type === 'phone' && existingUser.phoneVerified) {
            res.status(400).json({
                success: false,
                message: 'This phone number is already registered and verified',
            });
            return;
        }

        // Generate OTP
        const otp = generateOTP();

        // Delete any existing OTPs for this email/phone
        await OTP.deleteMany(type === 'email' ? { email } : { phone });

        // Create new OTP
        await OTP.create({
            email: type === 'email' ? email : undefined,
            phone: type === 'phone' ? phone : undefined,
            otp,
            type,
        });

        // Send OTP
        if (type === 'email') {
            await sendOTPEmail(email, otp);
        } else {
            await sendPhoneOTP(phone, otp);
        }

        res.status(200).json({
            success: true,
            message: `OTP sent to your ${type}`,
        });
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send OTP',
        });
    }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email, phone, otp, type } = req.body;

        if (!otp) {
            res.status(400).json({
                success: false,
                message: 'OTP is required',
            });
            return;
        }

        // Find OTP
        const otpRecord = await OTP.findOne({
            [type === 'email' ? 'email' : 'phone']: type === 'email' ? email : phone,
            otp,
            type,
            verified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP',
            });
            return;
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify OTP',
        });
    }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
export const resendOTP = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { email, phone, type } = req.body;

        // Delete existing OTPs
        await OTP.deleteMany(
            type === 'email' ? { email } : { phone }
        );

        // Generate new OTP
        const otp = generateOTP();

        // Create new OTP
        await OTP.create({
            email: type === 'email' ? email : undefined,
            phone: type === 'phone' ? phone : undefined,
            otp,
            type,
        });

        // Send OTP
        if (type === 'email') {
            await sendOTPEmail(email, otp);
        } else {
            await sendPhoneOTP(phone, otp);
        }

        res.status(200).json({
            success: true,
            message: `OTP resent to your ${type}`,
        });
    } catch (error: any) {
        console.error('Error resending OTP:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to resend OTP',
        });
    }
};
