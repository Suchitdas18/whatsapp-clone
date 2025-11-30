import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
    _id: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    isGroupChat: boolean;
    groupName?: string;
    groupAvatar?: string;
    groupAdmin?: mongoose.Types.ObjectId;
    lastMessage?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],
        isGroupChat: {
            type: Boolean,
            default: false,
        },
        groupName: {
            type: String,
            trim: true,
            maxlength: [50, 'Group name cannot exceed 50 characters'],
        },
        groupAvatar: {
            type: String,
            default: '',
        },
        groupAdmin: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    },
    {
        timestamps: true,
    }
);

// Validate group chat
chatSchema.pre('save', function (next) {
    if (this.isGroupChat) {
        if (!this.groupName) {
            return next(new Error('Group name is required for group chats'));
        }
        if (this.participants.length < 2) {
            return next(new Error('Group chat must have at least 2 participants'));
        }
        if (!this.groupAdmin) {
            return next(new Error('Group admin is required for group chats'));
        }
    } else {
        if (this.participants.length !== 2) {
            return next(new Error('Direct chat must have exactly 2 participants'));
        }
    }
    next();
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ isGroupChat: 1 });

export default mongoose.model<IChat>('Chat', chatSchema);
