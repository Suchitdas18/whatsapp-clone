# 🚀 WhatsApp Clone - Real-Time Chat Application

A full-featured WhatsApp-style chat application built with Next.js 14, Express, Socket.io, and MongoDB.

## ✨ Features

- 💬 Real-time 1-1 and group messaging
- ✓ Message status indicators (sent, delivered, seen)
- 👥 Online/offline status tracking
- 📎 Media sharing (images, videos, documents)
- 🔍 Message search
- 👤 User profiles and settings
- 📱 Responsive design (mobile + desktop)
- 🌙 Dark mode support
- 🔐 End-to-end encryption
- 🔔 Push notifications ready
- ✏️ Edit and delete messages
- 👀 Read receipts
- ⌨️ Typing indicators

## 🛠️ Tech Stack

### Frontend
- Next.js 14 with React Server Components
- TailwindCSS for styling
- Zustand for state management
- Shadcn UI components
- Socket.io-client for real-time communication
- Axios for API calls

### Backend
- Node.js with Express
- Socket.io for real-time events
- JWT authentication
- Multer for file uploads
- BCrypt for password hashing
- MongoDB with Mongoose ODM

### Storage & Hosting
- Cloudinary for media storage
- Vercel for frontend hosting
- Railway/Render for backend hosting
- MongoDB Atlas for database

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

```bash
cd server
npm install

# Create .env file with:
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# CLIENT_URL=http://localhost:3000

npm run dev
```

### Frontend Setup

```bash
cd client
npm install

# Create .env.local file with:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

npm run dev
```

## 🚀 Deployment

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

See detailed deployment instructions below.

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Socket Events](./docs/SOCKET_EVENTS.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🎨 UI Preview

```
┌─────────────────────────────────────────────────────────────┐
│  ☰  WhatsApp Clone                    🌙 👤 ⋮              │
├──────────────┬──────────────────────────────────────────────┤
│              │  Alice Johnson                      ... ⋮    │
│  🔍 Search   │  Online                                      │
│              ├──────────────────────────────────────────────┤
│ ┌──────────┐ │                                             │
│ │ 👤 Alice │ │  ┌─────────────────────┐                   │
│ │ Hey!     │ │  │ Hi! How are you?    │ 10:30 AM ✓✓      │
│ │ 10:35 AM │ │  └─────────────────────┘                   │
│ └──────────┘ │                                             │
│              │              ┌──────────────────────┐        │
│ ┌──────────┐ │              │ I'm good, thanks! 😊│        │
│ │ 👤 Bob   │ │              │ 10:32 AM ✓✓         │        │
│ │ Let's... │ │              └──────────────────────┘        │
│ │ 9:15 AM  │ │                                             │
│ └──────────┘ │  Alice is typing...                         │
│              ├──────────────────────────────────────────────┤
│ ┌──────────┐ │  📎 😊  Type a message...         [Send]    │
│ │ 👥 Team  │ │                                             │
│ │ Meeting  │ │                                             │
│ │ Yes 8:00 │ │                                             │
│ └──────────┘ │                                             │
└──────────────┴──────────────────────────────────────────────┘
```

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

Built with ❤️ 
