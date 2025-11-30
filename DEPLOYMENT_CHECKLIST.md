# 🚀 QUICK DEPLOYMENT CHECKLIST

Follow these steps in order:

## ✅ **BEFORE YOU START:**

- [ ] Make sure your app works locally (both chat and login)
- [ ] Have your MongoDB connection string ready
- [ ] Have your Cloudinary credentials ready

---

## 📝 **STEP-BY-STEP:**

### **1. Push to GitHub (5 mins)**
```powershell
cd C:\project\whatsappclone
git init
git add .
git commit -m "Initial commit"
```

- [ ] Go to https://github.com/new
- [ ] Create repository: `whatsapp-clone`
- [ ] Run:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/whatsapp-clone.git
git branch -M main
git push -u origin main
```

### **2. Deploy Backend on Render (10 mins)**

- [ ] Go to https://render.com → Sign up with GitHub
- [ ] Click "New +" → "Web Service"
- [ ] Select your `whatsapp-clone` repository
- [ ] Configure:
  - Root Directory: `server`
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Plan: **Free**

- [ ] Add Environment Variables:
  ```
  NODE_ENV = production
  PORT = 5000
  MONGODB_URI = (paste from your .env)
  JWT_SECRET = (paste from your .env)
  JWT_EXPIRE = 7d
  CLOUDINARY_CLOUD_NAME = dby3psfvv
  CLOUDINARY_API_KEY = 539885585115161
  CLOUDINARY_API_SECRET = Mtbv5R6qJOAT9i6Eim8JAYktaDg
  CLIENT_URL = (you'll update this after Vercel)
  MAX_FILE_SIZE = 10485760
  ```

- [ ] Click "Create Web Service"
- [ ] **Wait for deployment** (5-10 mins)
- [ ] **Copy your Render URL**: `https://whatsapp-clone-backend-xxxx.onrender.com`

### **3. Deploy Frontend on Vercel (5 mins)**

- [ ] Go to https://vercel.com → Sign up with GitHub  
- [ ] Click "Add New..." → "Project"
- [ ] Import `whatsapp-clone` repository
- [ ] Configure:
  - Root Directory: `client`
  - Framework: Next.js (auto-detected)

- [ ] Environment Variables:
  ```
  NEXT_PUBLIC_API_URL = https://YOUR_RENDER_URL.onrender.com/api
  NEXT_PUBLIC_SOCKET_URL = https://YOUR_RENDER_URL.onrender.com
  ```
  
  **Replace with your actual Render URL!**

- [ ] Click "Deploy"
- [ ] **Wait for deployment** (2-5 mins)
- [ ] **Copy your Vercel URL**: `https://whatsapp-clone-xxxx.vercel.app`

### **4. Update Backend CORS (2 mins)**

- [ ] Go back to Render Dashboard
- [ ] Click your backend service
- [ ] Go to "Environment" tab
- [ ] Update `CLIENT_URL` to your Vercel URL:
  ```
  CLIENT_URL = https://whatsapp-clone-xxxx.vercel.app
  ```
- [ ] Save Changes (will auto-redeploy)

### **5. Test Your App! 🎉**

- [ ] Open your Vercel URL
- [ ] Sign up with a new account
- [ ] Send a message
- [ ] Try video call from different device!

---

## 🎯 **YOUR URLs:**

**Frontend:** `https://________________________.vercel.app`

**Backend:** `https://________________________.onrender.com`

**Health Check:** `https://________________________.onrender.com/health`

(Fill in after deployment!)

---

## ❗ **Common Issues:**

**Backend logs show MongoDB error:**
→ Check your `MONGODB_URI` environment variable

**Frontend shows "Connection refused":**
→ Make sure `NEXT_PUBLIC_API_URL` ends with `/api`

**Video calls not working:**
→ Try from different browsers/devices (works better after deployment!)

**Render backend sleeping:**
→ Free tier sleeps after 15 mins. First request will wake it (30 secs)

---

**TOTAL TIME: ~20-25 minutes** ⏱️

**Once deployed, share the link with your friends!** 🚀
