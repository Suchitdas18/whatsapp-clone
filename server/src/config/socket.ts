import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    console.log('✅ Socket.io initialized');

    return io;
};

export default initializeSocket;
