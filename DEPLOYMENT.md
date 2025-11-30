# 🚀 Deployment Guide - WhatsApp Clone

This guide will walk you through deploying your WhatsApp Clone application to production.

## 📋 Prerequisites

Before deploying, ensure you have:
- [x] GitHub account
- [x] MongoDB Atlas account (free tier available)
- [x] Cloudinary account (free tier available)
- [x] Vercel account  (for frontend)
- [x] Railway or Render account (for backend)

---

## 1️⃣ MongoDB Atlas Setup

### Create Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new account or sign in
3. Create a new cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy your connection string (looks like `mongodb+srv://...`)
6. Replace `<password>` with your database user password

### Configure Network Access
1. Go to "Network Access" in Atlas
2. Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)
3. (For production, restrict to specific IPs)

---

## 2️⃣ Cloudinary Setup

### Get API Credentials
1. Go to [Cloudinary](https://cloudinary.com)
2. Create account or sign in
3. Go to Dashboard
4. Copy these values:
   - Cloud Name
   - API Key
   - API Secret

---

## 3️⃣ Backend Deployment (Railway)

### Option A: Deploy to Railway

1. **Push Code to GitHub**
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Express app

3. **Add Environment Variables**
   Go to your project → Variables → Add these:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   MAX_FILE_SIZE=10485760
   ```

4. **Deploy**
   - Railway will automatically deploy
   - Copy your backend URL (e.g., `https://your-app.up.railway.app`)

### Option B: Deploy to Render

1. **Push Code to GitHub** (same as above)

2. **Deploy on Render**
   - Go to [Render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `whatsapp-clone-backend`
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

3. **Add Environment Variables** (same as Railway)

4. **Deploy**
   - Render will build and deploy
   - Copy your backend URL

---

## 4️⃣ Frontend Deployment (Vercel)

1. **Update Environment Variables**
   Create `.env.local` in the `client` folder:
   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app/api
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.up.railway.app
   ```

2. **Push to GitHub**
   ```bash
   cd client
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Deploy on Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

4. **Add Environment Variables**
   In Vercel project settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app/api
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.up.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy
   - You'll get a URL like `https://your-app.vercel.app`

6. **Update Backend CLIENT_URL**
   - Go back to Railway/Render
   - Update `CLIENT_URL` environment variable to your Vercel URL
   - Redeploy backend

---

## 5️⃣ Final Configuration

### Enable Socket.io CORS
Your backend is already configured, but verify in `server/src/config/socket.ts`:
```typescript
cors: {
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST'],
  credentials: true,
}
```

### Test the Application
1. Visit your Vercel URL
2. Register a new account
3. Try sending messages
4. Check real-time updates

---

## 6️⃣ Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Railway/Render
1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records

---

## 🔧 Troubleshooting

### Socket.io Connection Issues
- Check CORS settings in backend
- Ensure `CLIENT_URL` matches your frontend URL exactly
- Verify Socket.io URL in frontend `.env.local`

### Database Connection Errors
- Check MongoDB Atlas network access (0.0.0.0/0)
- Verify connection string is correct
- Check database user password

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits in environment variables

### Build Failures
- Check Node.js version (use 18.x or higher)
- Clear cache and rebuild
- Check build logs for specific errors

---

## 📊 Monitoring

### Railway
- View logs in real-time from dashboard
- Monitor resource usage

### Render
- Access logs from the web service page
- Set up log streaming

### Vercel
- View deployment logs
- Monitor analytics

---

## 🔐 Security Checklist

- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)
- [ ] Restrict MongoDB network access in production
- [ ] Set proper CORS origins
- [ ] Never commit `.env` files to git
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (add in production)
- [ ] Regular security updates

---

## 🎉 Success!

Your WhatsApp Clone is now live! Share the URL and start chatting!

**Frontend:** `https://your-app.vercel.app`  
**Backend:** `https://your-backend.up.railway.app`

---

## 📚 Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Cloudinary Docs](https://cloudinary.com/documentation)
