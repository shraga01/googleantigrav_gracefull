---
description: Troubleshooting Cloud Run with MongoDB Atlas and Firebase Authentication
---

# Cloud Run + MongoDB + Firebase Integration

Lessons learned from debugging common issues when deploying a stack with:
- **Frontend**: React/Vite deployed to Firebase Hosting
- **Backend**: Node.js/Express deployed to Cloud Run
- **Database**: MongoDB Atlas
- **Auth**: Firebase Authentication

---

## 1. CORS Configuration for Cloud Run

**Problem**: Cloud Run backend blocks requests from Firebase Hosting domains.

**Symptoms**: 
- Console shows `Access-Control-Allow-Origin` errors
- API calls fail with `ERR_FAILED` or CORS errors

**Solution**: Add ALL your frontend domains to CORS whitelist in server code:

```javascript
const allowedOrigins = [
    'http://localhost:5173',                        // Local dev (Vite default)
    'https://your-app.web.app',                     // Firebase Hosting production
    'https://your-app-275bf.web.app',               // Firebase default domain
    'https://your-app-275bf--dev-xyzabc.web.app'    // Firebase preview channels
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

**Note**: Firebase preview channel URLs have format: `{project-id}--{channel-name}-{random}.web.app`

---

## 2. API Timeout for Cloud Run Cold Starts

**Problem**: API calls timeout because Cloud Run instances sleep when idle.

**Symptoms**:
- First request after idle period times out
- Subsequent requests work fine
- Server logs show request received AFTER frontend gave up

**Solution**: Increase frontend API timeout to 30+ seconds:

```typescript
const API_TIMEOUT = 30000; // 30 seconds for Cloud Run cold starts
```

**Why 30 seconds?**
- Cloud Run cold start: ~5-10 seconds
- MongoDB connection: ~3-5 seconds  
- Request processing: ~1-2 seconds
- Total worst case: ~15-20 seconds

---

## 3. MongoDB Atlas IP Whitelisting

**Problem**: Cloud Run cannot connect to MongoDB Atlas.

**Symptoms**:
- Server logs show `MongooseError: Operation buffering timed out`
- Database queries fail with timeout errors

**Solution**: 
1. Go to MongoDB Atlas → Network Access → IP Access List
2. Click "ADD IP ADDRESS"
3. Click "ALLOW ACCESS FROM ANYWHERE" (adds `0.0.0.0/0`)
4. Click Confirm

**Why allow all IPs?**: Cloud Run uses dynamic IP addresses. You cannot whitelist a specific IP.

---

## 4. MongoDB Connection Stuck on Cloud Run

**Problem**: MongoDB connection gets stuck even with correct configuration.

**Symptoms**:
- Health endpoint works (`/health` returns 200)
- Database operations timeout
- IP whitelist is correct
- Connection string is correct

**Solution**: Redeploy Cloud Run to force fresh instance:

```bash
gcloud run deploy SERVICE_NAME --source . --region REGION --allow-unauthenticated
```

**Why this happens**: Sometimes Mongoose connection gets into a bad state. Fresh deployment fixes it.

---

## 5. Debugging Checklist

When Cloud Run + MongoDB + Firebase isn't working:

1. **Check CORS** (Frontend console)
   - Look for `Access-Control-Allow-Origin` errors
   - Verify all frontend domains are in allowed origins

2. **Check timeouts** (Frontend console)
   - Look for `net::ERR_FAILED` or timeout errors
   - Increase API timeout to 30+ seconds

3. **Check MongoDB connection** (Cloud Run logs)
   ```bash
   gcloud run services logs read SERVICE_NAME --region REGION --limit 30
   ```
   - Look for `✅ Connected to MongoDB` or error messages
   - If connection errors, check IP whitelist in MongoDB Atlas

4. **Force fresh deployment** if connection stuck:
   ```bash
   gcloud run deploy SERVICE_NAME --source . --region REGION
   ```

---

## Quick Commands

```bash
# View Cloud Run logs
gcloud run services logs read SERVICE_NAME --region REGION --limit 50

# Check Cloud Run environment variables
gcloud run services describe SERVICE_NAME --region REGION --format="yaml(spec.template.spec.containers[0].env)"

# Redeploy from source
gcloud run deploy SERVICE_NAME --source . --region REGION --allow-unauthenticated

# Deploy to Firebase Hosting dev channel
firebase hosting:channel:deploy dev
```
