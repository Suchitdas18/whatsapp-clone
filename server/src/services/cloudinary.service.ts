import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export interface UploadResult {
    url: string;
    publicId: string;
    format: string;
    size: number;
}

class CloudinaryService {
    /**
     * Upload file to Cloudinary
     */
    async uploadFile(
        fileBuffer: Buffer,
        folder: string = 'whatsapp-clone',
        resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'
    ): Promise<UploadResult> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: resourceType,
                    transformation: resourceType === 'image' ? [
                        { width: 1200, height: 1200, crop: 'limit' },
                        { quality: 'auto' },
                        { fetch_format: 'auto' },
                    ] : undefined,
                },
                (error, result: UploadApiResponse | undefined) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            format: result.format,
                            size: result.bytes,
                        });
                    } else {
                        reject(new Error('Upload failed: No result returned'));
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });
    }

    /**
     * Delete file from Cloudinary
     */
    async deleteFile(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
            throw error;
        }
    }

    /**
     * Upload multiple files
     */
    async uploadMultipleFiles(
        files: Buffer[],
        folder: string = 'whatsapp-clone'
    ): Promise<UploadResult[]> {
        const uploadPromises = files.map((file) =>
            this.uploadFile(file, folder)
        );
        return Promise.all(uploadPromises);
    }
}

export default new CloudinaryService();
