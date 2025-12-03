# Backend Deployment to Render - Step by Step

## Step 1: Sign Up for Render

1. Go to: **https://render.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"** (easiest option)
4. Authorize Render to access your GitHub account
5. You'll be redirected to the Render dashboard

---

## Step 2: Create a New Web Service

1. On the Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories
4. Find and click **"Connect"** next to `googleantigrav_gracefull`

---

## Step 3: Configure Your Web Service

Fill in these settings **EXACTLY as shown:**

### Basic Settings:
- **Name**: `daily-appreciation-backend`
- **Region**: Choose closest to you (e.g., Oregon USA, Frankfurt EU)
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`

### Build & Deploy Settings:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Instance Type:
- **Instance Type**: Select **"Free"** (first option)

---

## Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**

Add these **5 variables** one by one:

### Variable 1:
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://shraga013_db_user:amLSQ36xjkk98iN3@YOUR_CLUSTER.mongodb.net/daily-appreciation?retryWrites=true&w=majority`
  
  ⚠️ **IMPORTANT**: Replace `YOUR_CLUSTER` with your actual MongoDB cluster address!

### Variable 2:
- **Key**: `PORT`
- **Value**: `3001`

### Variable 3:
- **Key**: `NODE_ENV`
- **Value**: `production`

### Variable 4:
- **Key**: `JWT_SECRET`
- **Value**: `daily-appreciation-super-secret-key-2024-production`

### Variable 5:
- **Key**: `FRONTEND_URL`
- **Value**: `http://localhost:5173`
  
  ⚠️ **NOTE**: We'll update this later with your Vercel URL

---

## Step 5: Deploy!

1. Scroll to the bottom
2. Click **"Create Web Service"**
3. Render will start building and deploying your backend
4. **Wait 5-10 minutes** for deployment to complete

You'll see logs scrolling - this is normal!

---

## Step 6: Get Your Backend URL

Once deployment is complete:

1. You'll see **"Live"** with a green dot at the top
2. Your backend URL will be shown (something like):
   ```
   https://daily-appreciation-backend-xxxx.onrender.com
   ```
3. **COPY THIS URL** - you'll need it for frontend deployment!

---

## Step 7: Test Your Backend

1. Click on your backend URL or visit:
   ```
   https://your-backend-url.onrender.com/health
   ```
2. You should see:
   ```json
   {"status":"ok","timestamp":"2024-..."}
   ```

✅ **If you see this, your backend is working!**

---

## Troubleshooting

### "Build failed"
- Check the logs for errors
- Verify `server/package.json` exists
- Make sure `Root Directory` is set to `server`

### "MongoDB connection failed"
- Verify your `MONGODB_URI` is correct
- Check MongoDB Atlas network access allows all IPs (0.0.0.0/0)
- Verify username and password are correct

### "Application failed to respond"
- Check that `Start Command` is `npm start`
- Verify `PORT` environment variable is set to `3001`
- Check logs for errors

---

## Next Steps

After your backend is deployed:
1. Copy your backend URL
2. We'll deploy the frontend to Vercel
3. Update the `FRONTEND_URL` environment variable in Render

---

## Important Notes

⚠️ **Free Tier Limitations:**
- Backend will sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (cold start)
- Upgrade to $7/month for always-on service

✅ **Auto-Deploy:**
- Every time you push to GitHub, Render auto-deploys
- No manual deployment needed!

---

## Your Backend URL

Once deployed, save this URL:
```
https://daily-appreciation-backend-xxxx.onrender.com
```

You'll need it for the frontend deployment!
