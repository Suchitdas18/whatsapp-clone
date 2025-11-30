import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Configure storage for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'audio/mpeg',
        'audio/wav',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, videos, documents, and audio files are allowed.'));
    }
};

// Configure multer
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    },
});

export default upload;
