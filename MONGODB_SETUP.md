# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google (recommended) or email
3. Complete the registration

## Step 2: Create a New Cluster

1. After logging in, click **"Build a Database"** or **"Create"**
2. Choose **FREE** tier (M0 Sandbox)
   - 512 MB storage
   - Shared RAM
   - Perfect for development
3. **Cloud Provider:** Choose **Google Cloud** (recommended)
4. **Region:** Choose closest to you (e.g., `us-central1` or `europe-west1`)
5. **Cluster Name:** `daily-appreciation-cluster` (or keep default)
6. Click **"Create Deployment"**

## Step 3: Create Database User

You'll see a security quickstart:

1. **Authentication Method:** Username and Password
2. **Username:** `daily_app_user` (or your choice)
3. **Password:** Click **"Autogenerate Secure Password"**
   - **IMPORTANT:** Copy and save this password immediately!
   - Example: `xK9mP2nQ7vR4sL8w`
4. Click **"Create Database User"**

## Step 4: Configure Network Access

1. **Where would you like to connect from?**
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. **For deployment, also add:** `0.0.0.0/0` (allows access from anywhere)
   - Click **"Add IP Address"**
   - Enter `0.0.0.0/0`
   - Description: "Allow all (for Cloud Run)"
   - Click **"Add Entry"**
5. Click **"Finish and Close"**

## Step 5: Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. **Driver:** Node.js
4. **Version:** 6.8 or later
5. Copy the connection string:
   ```
   mongodb+srv://daily_app_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Create Database and Collection

1. Click **"Browse Collections"** on your cluster
2. Click **"Add My Own Data"**
3. **Database name:** `daily-appreciation`
4. **Collection name:** `users`
5. Click **"Create"**

## Step 7: Update Backend Configuration

Create `server/.env` file with:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://daily_app_user:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/daily-appreciation?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `YOUR_PASSWORD_HERE` with the password you copied
- `cluster0.xxxxx` with your actual cluster address
- `your-super-secret-jwt-key` with a random string

## Step 8: Test Connection

1. Save the `.env` file
2. Restart your backend server (it's already running)
3. You should see: `✅ MongoDB connected successfully`

---

## Quick Reference

**Your MongoDB Details:**
- **Cluster:** daily-appreciation-cluster
- **Database:** daily-appreciation
- **User:** daily_app_user
- **Password:** [the one you saved]

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

---

## Troubleshooting

**Connection timeout?**
- Check IP whitelist (add `0.0.0.0/0`)
- Verify username/password

**Authentication failed?**
- Double-check password (no extra spaces)
- Ensure user has read/write permissions

**Database not found?**
- MongoDB creates databases automatically on first write
- No need to create manually
