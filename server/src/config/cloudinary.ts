import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration
const validateCloudinaryConfig = (): void => {
    const { cloud_name, api_key, api_secret } = cloudinary.config();

    if (!cloud_name || !api_key || !api_secret) {
        console.warn('⚠️ Cloudinary configuration is incomplete. File uploads may not work.');
    } else {
        console.log('✅ Cloudinary configured successfully');
    }
};

validateCloudinaryConfig();

export default cloudinary;
