import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
    email?: string;
    phone?: string;
    otp: string;
    type: 'email' | 'phone';
    verified: boolean;
    expiresAt: Date;
    createdAt: Date;
}

const OTPSchema = new Schema<IOTP>(
    {
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['email', 'phone'],
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
    },
    {
        timestamps: true,
    }
);

// Index for auto-deletion of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Ensure either email or phone is provided
OTPSchema.pre('save', function (next) {
    if (!this.email && !this.phone) {
        next(new Error('Either email or phone must be provided'));
    } else {
        next();
    }
});

export default mongoose.model<IOTP>('OTP', OTPSchema);
