# Development Workflow & Collaboration Guide

This guide explains how to set up a **Test Environment**, add a **Co-developer**, and manage your development workflow safely without breaking your live production app.

---

## Part 1: Add a Co-Developer

To give another developer access to your code:

1. **GitHub Access (Code)**
   - Go to your repository on GitHub.
   - Click **Settings** → **Collaborators**.
   - Click **Add people**.
   - Enter their email or username and invite them.
   - *They will receive an email to accept the invitation.*

2. **Google Cloud Access (Deployment)**
   - Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam).
   - Click **Grant Access**.
   - Enter their email.
   - Assign roles:
     - **Cloud Run Developer** (to deploy backend)
     - **Firebase Admin** (to deploy frontend)
     - **Service Usage Consumer**
   - Click **Save**.

3. **MongoDB Access (Database)**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/).
   - Click **Project Access** → **Invite**.
   - Enter their email.
   - Role: **Project Owner** or **Project Data Access Read/Write**.

---

## Part 2: Create a Test Environment

We will create a separate "Test" version of your app so you can break things safely.

### 1. Test Database
You don't need to pay for a new cluster. Just use a different database name.
- **Production Connection String**: `.../daily-appreciation?retryWrites=true...`
- **Test Connection String**: `.../daily-appreciation-test?retryWrites=true...`

### 2. Test Backend (Cloud Run)
We will deploy a separate copy of your backend for testing.

**Test Backend URL**: `https://daily-appreciation-backend-test-166302672328.us-central1.run.app`

(You have already deployed this!)

### 3. Test Frontend (Firebase Preview Channels)
Firebase has a built-in feature for testing called "Preview Channels".

**Run this in PowerShell:**
```powershell
# Build your app (make sure .env.production is temporarily pointing to your TEST backend if needed, or use .env.local for local dev)
npm run build

# Deploy to a temporary "preview" channel (expires in 7 days by default)
firebase hosting:channel:deploy test-feature
```
**Test Frontend URL**: `https://chen-and-yossi-co--test-env-2pynwvlx.web.app`

(Share this URL with your co-developer!)

---

## Part 3: Co-Developer Onboarding Guide

Send these instructions to your co-developer:

### 1. Get the Code
```bash
git clone https://github.com/shraga01/googleantigrav_gracefull.git
cd daily-appreciation-app
```

### 2. Install Dependencies
```bash
npm install
cd server
npm install
cd ..
```

### 3. Setup Local Environment
Create a `.env` file in the root folder:
```env
VITE_API_URL=http://localhost:3001/api
```

Create a `.env` file in the `server` folder:
```env
PORT=3001
MONGODB_URI=mongodb+srv://shraga013_db_user:amLSQ36xjkk98iN3@cluster0.mongodb.net/daily-appreciation-test?retryWrites=true&w=majority
JWT_SECRET=test-secret-key-123
FRONTEND_URL=http://localhost:5173
```
*Note: Share the real MongoDB password securely via a password manager, do not commit it to GitHub.*

### 4. Run Locally
The developer needs two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## Part 4: Development Workflow

1. **Create a Branch**: Never work on `main` directly.
   ```bash
   git checkout -b feature/new-cool-feature
   ```
2. **Code & Test Locally**: Run the app on `localhost`.
3. **Push to GitHub**:
   ```bash
   git push origin feature/new-cool-feature
   ```
4. **Deploy to Test**:
   - Deploy backend to `daily-appreciation-backend-test`.
   - Deploy frontend to Firebase Preview Channel.
   - Share the URL with your team for review.
5. **Merge to Main**: Once tested, merge the branch into `main` on GitHub.
## Part 5: Git Strategy (Important!)

**❓ Question:** Should I create a separate "Test Repository" on GitHub?
**✅ Answer:** **NO!** You should work in the **SAME** repository.

We use **Branches** to separate code:

1.  **`main` Branch** = **PRODUCTION** 🟢
    *   This code is always "safe" and working.
    *   This is what your live users see.
    *   *Never push directly to main!*

2.  **Feature Branches** = **DEVELOPMENT** 🟡
    *   Create a new branch for every new task (e.g., `feature/add-dark-mode`).
    *   This is where you and your co-developer work.
    *   You deploy *these* branches to your Test Environment.

### How to merge safely:
1.  Create a branch: `git checkout -b feature/my-new-feature`
2.  Work, commit, and push: `git push origin feature/my-new-feature`
3.  **Test** it on the Test Environment.
4.  Create a **Pull Request (PR)** on GitHub to merge `feature/my-new-feature` into `main`.
5.  Once merged, the new feature is ready for Production deployment!
