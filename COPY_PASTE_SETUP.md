# 🎯 COPY THIS TO YOUR FILES

## For Backend: server/.env

Copy everything below this line to `server/.env`:

```
PORT=5000
NODE_ENV=development

MONGODB_URI=PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE

JWT_SECRET=8a9f2c5e7b3d1a6c4f9e2b8d5a7c3e1f9b4d6a8c2e5f7a9c1d3e6b8f4a7c9e2d
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=dby3psfvv
CLOUDINARY_API_KEY=539885585115161
CLOUDINARY_API_SECRET=Mtbv5R6qJOAT9i6Eim8JAYktaDg

CLIENT_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
```

**Don't forget to replace `PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE` with your actual MongoDB Atlas connection string!**

---

## For Frontend: client/.env.local

Copy everything below this line to `client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📝 How to Create These Files

### Windows (PowerShell or Command Prompt):

**Create backend .env:**
```powershell
# Navigate to server folder
cd server

# Create .env file from .env.READY
copy .env.READY .env

# Open in notepad to edit MongoDB URI
notepad .env
```

**Create frontend .env.local:**
```powershell
# Navigate to client folder
cd client

# Create .env.local file
copy .env.local.READY .env.local
```

### Or Use VS Code:

1. Right-click `server/.env.READY` → Rename to `.env`
2. Open `server/.env` in VS Code
3. Replace `PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE` with your MongoDB string
4. Right-click `client/.env.local.READY` → Rename to `.env.local`

---

## 🔗 Get MongoDB Connection String

**Quick Link:** https://cloud.mongodb.com/cloud/login

1. Sign up (free, no credit card)
2. Create free cluster (M0)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<password>` in the string with your database password

**Example connection string:**
```
mongodb+srv://myuser:mypassword123@cluster0.abcde.mongodb.net/whatsapp-clone?retryWrites=true&w=majority
```

---

## ✅ Quick Test Commands

After creating the files, test:

```bash
# Terminal 1
cd server
npm install
npm run dev

# Terminal 2
cd client
npm install
npm run dev
```

Open: http://localhost:3000

---

That's it! All your Cloudinary credentials are ready. Just add MongoDB and you're live! 🚀
