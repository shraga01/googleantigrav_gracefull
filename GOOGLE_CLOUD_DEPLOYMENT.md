# Google Cloud Deployment Guide - Complete Setup

## Architecture Overview

```
USER → Firebase Hosting (Frontend) → Cloud Run (Backend) → MongoDB Atlas (Database)
```

**Data Flow:**
- **MongoDB Atlas**: Stores ALL user data (profiles, entries, streaks)
- **Google Cloud Run**: Runs your API server, talks to MongoDB
- **Firebase Hosting**: Serves your React app to users

---

## Prerequisites

✅ Google Cloud account (you have this)
✅ GitHub repository with code (you have this)
✅ MongoDB Atlas credentials (you have this)

---

# PART 1: Deploy Backend to Google Cloud Run

## Step 1: Enable Required APIs

1. Go to: https://console.cloud.google.com/
2. Select your project (or create a new one)
3. Go to **APIs & Services** → **Enable APIs and Services**
4. Search and enable:
   - **Cloud Run API**
   - **Cloud Build API**
   - **Artifact Registry API**

## Step 2: Install Google Cloud CLI (if not installed)

1. Download from: https://cloud.google.com/sdk/docs/install
2. Run installer
3. Open **NEW** PowerShell and run:
   ```powershell
   gcloud init
   ```
4. Login with your Google account
5. Select your project

## Step 3: Prepare Backend for Deployment

Navigate to your project:
```powershell
cd C:\Users\OSUser\.gemini\antigravity\playground\obsidian-equinox\daily-appreciation-app\server
```

Create a `Dockerfile` in the `server` folder:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Create `.dockerignore` in the `server` folder:
```
node_modules
.env
.env.local
*.log
```

## Step 4: Deploy to Cloud Run

Run these commands in PowerShell (from `server` folder):

```powershell
# Build and deploy
gcloud run deploy daily-appreciation-backend `
  --source . `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "NODE_ENV=production,PORT=3001,JWT_SECRET=daily-appreciation-secret-2024,MONGODB_URI=mongodb+srv://shraga013_db_user:amLSQ36xjkk98iN3@YOUR_CLUSTER.mongodb.net/daily-appreciation?retryWrites=true&w=majority,FRONTEND_URL=https://your-app.web.app"
```

**Replace:**
- `YOUR_CLUSTER` with your MongoDB cluster address
- `your-app` will be replaced after frontend deployment

**Wait 5-10 minutes for deployment**

## Step 5: Get Backend URL

After deployment, you'll see:
```
Service URL: https://daily-appreciation-backend-xxxxx-uc.a.run.app
```

**SAVE THIS URL!** You'll need it for frontend.

## Step 6: Test Backend

Visit: `https://your-backend-url/health`

Should see: `{"status":"ok","timestamp":"..."}`

✅ **Backend deployed!**

---

# PART 2: Deploy Frontend to Firebase Hosting

## Step 1: Install Firebase CLI

In PowerShell:
```powershell
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```powershell
firebase login
```

Browser will open - login with your Google account.

## Step 3: Initialize Firebase

Navigate to project root:
```powershell
cd C:\Users\OSUser\.gemini\antigravity\playground\obsidian-equinox\daily-appreciation-app
```

Initialize Firebase:
```powershell
firebase init
```

**Answer the prompts:**
- **Which Firebase features?** → Select **Hosting** (use spacebar, then Enter)
- **Use existing project or create new?** → **Use existing project**
- **Select project** → Choose your Google Cloud project
- **Public directory?** → Type: `dist`
- **Configure as single-page app?** → **Yes**
- **Set up automatic builds with GitHub?** → **No** (we'll do manual for now)
- **Overwrite index.html?** → **No**

## Step 4: Create Production Environment File

Create `.env.production` in project root:
```env
VITE_API_URL=https://your-backend-url-from-step-5/api
```

**Replace with your actual Cloud Run backend URL!**

## Step 5: Build Frontend

```powershell
npm run build
```

This creates the `dist` folder with your production-ready app.

## Step 6: Deploy to Firebase

```powershell
firebase deploy --only hosting
```

**Wait 2-3 minutes**

You'll see:
```
✔  Deploy complete!

Hosting URL: https://your-project-id.web.app
```

**SAVE THIS URL!** This is your live app!

## Step 7: Update Backend CORS

Go back to Cloud Run and update the `FRONTEND_URL` environment variable:

```powershell
gcloud run services update daily-appreciation-backend `
  --region us-central1 `
  --update-env-vars "FRONTEND_URL=https://your-project-id.web.app"
```

---

# PART 3: Verify Everything Works

## Test Complete Flow:

1. **Visit your app**: `https://your-project-id.web.app`
2. **Complete onboarding**
3. **Create a daily entry**
4. **Check MongoDB Atlas** → Browse Collections → Verify data is saved

✅ **If you see data in MongoDB, everything is working!**

---

# Architecture Summary

```
┌─────────────────────────────────────────┐
│  Firebase Hosting                       │
│  https://your-app.web.app               │
│  - Serves React app globally            │
│  - Free tier: 10GB/month                │
└─────────────────────────────────────────┘
              ↓ API Requests
┌─────────────────────────────────────────┐
│  Google Cloud Run                       │
│  https://backend-xxx.run.app            │
│  - Node.js API server                   │
│  - Auto-scales                          │
│  - Pay per use                          │
└─────────────────────────────────────────┘
              ↓ Database Queries
┌─────────────────────────────────────────┐
│  MongoDB Atlas                          │
│  mongodb+srv://...                      │
│  - Stores ALL user data                 │
│  - User profiles                        │
│  - Daily entries                        │
│  - Streak information                   │
└─────────────────────────────────────────┘
```

---

# Cost Breakdown

**MongoDB Atlas:**
- Free tier: 512MB storage
- Upgrade: $9/month for 2GB

**Google Cloud Run (Backend):**
- Pay per use
- ~$5-10/month for moderate traffic
- First 2 million requests free

**Firebase Hosting (Frontend):**
- Free tier: 10GB storage, 360MB/day transfer
- Upgrade: $0.026/GB beyond free tier

**Total estimated: $5-20/month** (depending on usage)

---

# Continuous Deployment

## Update Backend:
```powershell
cd server
gcloud run deploy daily-appreciation-backend --source .
```

## Update Frontend:
```powershell
npm run build
firebase deploy --only hosting
```

---

# Troubleshooting

**Backend won't deploy:**
- Check Dockerfile syntax
- Verify Cloud Run API is enabled
- Check logs: `gcloud run logs read`

**Frontend build fails:**
- Check `.env.production` has correct backend URL
- Run `npm install` first
- Check for TypeScript errors

**Can't connect to MongoDB:**
- Verify connection string in Cloud Run env vars
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Test connection locally first

**CORS errors:**
- Verify `FRONTEND_URL` in Cloud Run matches Firebase URL
- Check backend CORS configuration in `server/index.js`

---

# Next Steps

1. Set up custom domain (optional)
2. Enable Cloud Run minimum instances (no cold starts)
3. Set up MongoDB backups
4. Add monitoring and alerts
5. Set up CI/CD with GitHub Actions

---

# Important URLs

**Your Live App:** `https://your-project-id.web.app`
**Backend API:** `https://backend-xxx.run.app`
**Google Cloud Console:** https://console.cloud.google.com/
**Firebase Console:** https://console.firebase.google.com/
**MongoDB Atlas:** https://cloud.mongodb.com/
