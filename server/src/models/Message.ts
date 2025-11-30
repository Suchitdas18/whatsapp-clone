import mongoose, { Document, Schema } from 'mongoose';

export enum MessageStatus {
    SENT = 'sent',
    DELIVERED = 'delivered',
    SEEN = 'seen',
}

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    DOCUMENT = 'document',
    AUDIO = 'audio',
}

export interface IReadReceipt {
    user: mongoose.Types.ObjectId;
    readAt: Date;
}

export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    chat: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    encryptedContent?: string;
    type: MessageType;
    status: MessageStatus;
    readBy: IReadReceipt[];
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyTo?: mongoose.Types.ObjectId;
    isEdited: boolean;
    isDeleted: boolean;
    deletedFor: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        chat: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        content: {
            type: String,
            default: '',
        },
        encryptedContent: {
            type: String,
        },
        type: {
            type: String,
            enum: Object.values(MessageType),
            default: MessageType.TEXT,
        },
        status: {
            type: String,
            enum: Object.values(MessageStatus),
            default: MessageStatus.SENT,
        },
        readBy: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        fileUrl: {
            type: String,
        },
        fileName: {
            type: String,
        },
        fileSize: {
            type: Number,
        },
        replyTo: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedFor: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ status: 1 });

// Update chat's lastMessage when a new message is created
messageSchema.post('save', async function () {
    try {
        const Chat = mongoose.model('Chat');
        await Chat.findByIdAndUpdate(this.chat, {
            lastMessage: this._id,
        });
    } catch (error) {
        console.error('Error updating last message:', error);
    }
});

export default mongoose.model<IMessage>('Message', messageSchema);
