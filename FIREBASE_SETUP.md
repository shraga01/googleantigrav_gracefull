# Firebase Setup Guide

Follow these steps to set up Firebase for the Daily Appreciation App:

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `daily-appreciation-app` (or your preferred name)
4. **Disable Google Analytics** (we don't need it for privacy reasons)
5. Click **"Create project"**

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (</>) to add a web app
2. Enter app nickname: `Daily Appreciation Web`
3. **Do NOT check** "Also set up Firebase Hosting" (we'll do this separately)
4. Click **"Register app"**

## Step 3: Get Firebase Configuration

You'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**Copy these values** - you'll need them in the next step.

## Step 4: Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Enter support email (your email)
5. Click **Save**

## Step 5: Configure Authorized Domains

1. Still in **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost` (already there)
   - Your production domain (if you have one)

## Step 6: Create Environment File

Now create a `.env` file in your project root with the Firebase config:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Firebase Configuration (replace with your values)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Privacy Features
VITE_ENCRYPTION_ENABLED=true
```

## Step 7: Get Service Account Key (for Backend)

1. In Firebase Console, click the **gear icon** → **Project settings**
2. Go to **Service accounts** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** (downloads a JSON file)
5. **Keep this file secure** - it contains admin credentials

You'll need to add this to your backend later.

## Next Steps

Once you've completed these steps, let me know and I'll:
1. Create the Firebase initialization code
2. Set up the Google Sign-In button
3. Configure the backend to verify Firebase tokens

---

## Security Notes

✅ **What we collect from Google:**
- Email address (for login only)
- Google User ID (for key derivation)

❌ **What we DON'T collect:**
- Display name
- Profile photo
- Any other Google profile data

Your journal entries are encrypted on your device before being sent to the server. The server cannot read your content.
