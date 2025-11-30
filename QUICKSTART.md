# 🚀 Quick Start Guide - WhatsApp Clone

Get your WhatsApp Clone up and running in 5 minutes!

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

## 🎯 Step-by-Step Setup

### 1. Get MongoDB Connection String

**Option A: MongoDB Atlas (Recommended - Free)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

**Option B: Local MongoDB**
```bash
# Install MongoDB locally
# Connection string: mongodb://localhost:27017/whatsapp-clone
```

### 2. Get Cloudinary Credentials (for file uploads)

1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for free account
3. From dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Setup Backend

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create environment file
# Copy .env.example to .env
cp .env.example .env
```

**Edit `server/.env` with your credentials:**
```env
PORT=5000
NODE_ENV=development

# Your MongoDB connection string from Step 1
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-clone?retryWrites=true&w=majority

# Generate a random secret (at least 32 characters)
JWT_SECRET=your_super_secret_jwt_key_please_change_this_to_something_random

# Your Cloudinary credentials from Step 2
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### 4. Setup Frontend

```bash
# Navigate to client folder (open new terminal)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

**Edit `client/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 5. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.mongodb.net
✅ Socket.io initialized
🚀 Server running on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 6. Open the Application

1. Open browser: **http://localhost:3000**
2. Click "Sign up" to create an account
3. Fill in your details and register
4. You'll be automatically logged in!

## 🎉 You're Done!

### Test the Features

1. **Create a second account:**
   - Open incognito/private browser window
   - Go to http://localhost:3000
   - Register with different email

2. **Start chatting:**
   - Search for the other user
   - Click to create chat
   - Send messages and see them appear in real-time!

3. **Try features:**
   - ✅ Send text messages
   - ✅ Upload images/files
   - ✅ See message status (✓, ✓✓, ✓✓ blue)
   - ✅ Watch typing indicators
   - ✅ Toggle dark mode (moon icon)
   - ✅ Edit your profile

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "Cannot connect to MongoDB"**
- Check your MONGODB_URI in `server/.env`
- Make sure you replaced `<password>` with your actual password
- Verify network access is set to "Allow from anywhere" in MongoDB Atlas

**Error: "Port 5000 already in use"**
```bash
# Change PORT in server/.env to something else
PORT=5001
```

### Frontend won't start

**Error: "Module not found"**
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

**Error: "Cannot connect to server"**
- Make sure backend is running on http://localhost:5000
- Check `NEXT_PUBLIC_API_URL` in `client/.env.local`

### Socket.io not connecting

1. Check backend console for "Socket connected" messages
2. Verify `NEXT_PUBLIC_SOCKET_URL` matches your backend URL
3. Make sure `CLIENT_URL` in backend .env matches frontend URL

### File uploads failing

1. Verify Cloudinary credentials in `server/.env`
2. Check file size (max 10MB)
3. Look at backend console for error messages

---

## 📦 Project Structure

```
whatsapp-clone/
├── server/                  # Backend (Node.js + Express + Socket.io)
│   ├── src/
│   │   ├── index.ts        # Main entry point
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   └── socket/         # Real-time handlers
│   └── package.json
│
└── client/                  # Frontend (Next.js 14 + React)
    ├── src/
    │   ├── app/            # Pages (Next.js 14 app router)
    │   ├── components/     # React components
    │   ├── lib/            # Utilities, API, Socket
    │   └── store/          # Zustand state management
    └── package.json
```

---

## 🔑 Default Test Accounts

Create these manually after starting:

**Account 1:**
- Name: Alice Johnson
- Email: alice@example.com
- Password: password123

**Account 2:**
- Name: Bob Smith
- Email: bob@example.com
- Password: password123

---

## 📚 Next Steps

✅ **You're all set!** Your WhatsApp Clone is running locally.

**Want to deploy to production?**
→ See [DEPLOYMENT.md](./DEPLOYMENT.md)

**Want to customize?**
→ See [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

**Need help?**
→ Check the troubleshooting section above

---

## 🎨 Features You Can Test

- [x] User registration and login
- [x] Real-time messaging
- [x] Message status (sent, delivered, seen)
- [x] Online/offline indicators
- [x] Typing indicators
- [x] File uploads (images, videos, documents)
- [x] Dark mode
- [x] User profiles
- [x] Search users
- [x] Create 1-1 chats
- [x] Responsive design (try on mobile!)

---

## 💡 Tips

1. **Use Chrome DevTools** to see Network and Console for debugging
2. **Open two browser windows** side by side to chat with yourself
3. **Check backend console** for API requests and Socket.io events
4. **Try dark mode** - click the moon icon in the header
5. **Test on mobile** - the UI is fully responsive!

---

## 🚀 Performance Notes

- First message might take 2-3 seconds (MongoDB cold start)
- After that, messages are instant!
- File uploads depend on your internet speed
- Local development is much faster than production

---

**Happy Chatting! 💬✨**

If everything works, you should see real-time messages flowing between accounts with status updates and typing indicators!
