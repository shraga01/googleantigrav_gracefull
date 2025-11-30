# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

## Step 2: Create a Cluster
1. After logging in, click "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose one close to you)
4. Click "Create Cluster" (this takes 1-3 minutes)

## Step 3: Create Database User
1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username (e.g., `dailyapp`)
5. Click "Autogenerate Secure Password" and **SAVE THIS PASSWORD**
6. Set "Database User Privileges" to "Read and write to any database"
7. Click "Add User"

## Step 4: Configure Network Access
1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, you'd restrict this to specific IPs
4. Click "Confirm"

## Step 5: Get Connection String
1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as the driver
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update .env File
1. Open `server/.env` in your project
2. Replace the `MONGODB_URI` value with your connection string
3. Replace `<username>` with your database username
4. Replace `<password>` with the password you saved
5. Add `/daily-appreciation` before the `?` to specify the database name:
   ```
   mongodb+srv://dailyapp:yourpassword@cluster0.xxxxx.mongodb.net/daily-appreciation?retryWrites=true&w=majority
   ```

## Step 7: Test Connection
Run the backend server:
```bash
cd server
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:3001
```

## Troubleshooting
- **Authentication failed**: Check username and password in connection string
- **Network error**: Make sure you allowed access from anywhere (0.0.0.0/0)
- **Timeout**: Check your internet connection and cluster status

## Next Steps
Once connected, the backend is ready! We'll integrate it with the frontend next.
