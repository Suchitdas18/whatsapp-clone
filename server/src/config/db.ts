import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI as string;

        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error: any) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

// Handle connection errors
mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed due to app termination');
    process.exit(0);
});

export default connectDB;
