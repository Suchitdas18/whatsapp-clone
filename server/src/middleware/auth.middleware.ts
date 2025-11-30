import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        let token: string | undefined;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Not authorized to access this route',
            });
            return;
        }

        try {
            // Verify token
            const secret = process.env.JWT_SECRET || 'default-secret-key-change-this';
            const decoded = jwt.verify(token, secret) as {
                id: string;
            };

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
        });
    }
};
