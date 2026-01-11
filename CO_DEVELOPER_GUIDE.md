# 🤝 Co-Developer Onboarding Guide (Google Antigravity Edition)

Welcome to the **Daily Appreciation App** team! This guide explains how to set up your development environment using **Google Antigravity**.

---

## Phase 1: Access Google Antigravity

1.  **Log in** to your Google Antigravity environment (Project IDX / Gemini Code Assist).
2.  **Create a New Workspace**:
    *   Select **"Import Repo"** or **"Clone Repository"**.
    *   Enter our repository URL: `https://github.com/shraga01/googleantigrav_gracefull.git`
    *   This will automatically set up the environment with Node.js, Git, and the editor.

---

## Phase 2: Install and Configure Git (Windows/PowerShell)

If you're working on Windows (not in Antigravity cloud environment), you need to set up Git properly.

### 1. Install Git
1.  Download Git from: [git-scm.com/downloads](https://git-scm.com/downloads)
2.  Run the installer with default settings
3.  **Important:** Make sure "Git from the command line and also from 3rd-party software" is selected

### 2. Verify Git Installation
Open a **NEW** PowerShell window and run:
```powershell
git --version
```
You should see something like: `git version 2.x.x`

**If you get "git is not recognized":**
- Close PowerShell completely
- Open a **NEW** PowerShell window
- Try again

### 3. Configure Git
Set your name and email (this will appear in commits):
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4. Clone the Repository
Navigate to where you want the project folder:
```powershell
cd C:\Users\YourUsername\Documents
git clone https://github.com/shraga01/googleantigrav_gracefull.git
cd daily-appreciation-app
```

---

## Phase 3: Switch to Test Branch

**Important:** We do NOT work directly on the `main` branch.

1.  Open the **Terminal** in Antigravity (usually `Ctrl + \`` or via the menu).
2.  Run these commands:
    ```bash
    git fetch
    git checkout daily_test
    ```
3.  Install dependencies:
    ```bash
    # Install frontend dependencies
    npm install

    # Install backend dependencies
    cd server
    npm install
    cd ..
    ```

---

## Phase 4: Setup Secrets (Environment Variables)

You need to create **two** `.env` files. Ask the team lead for the real secrets (Database Password).

### 1. Frontend `.env` (in root folder)
Create a new file named `.env` in the main folder:
```env
# Local Development URL
VITE_API_URL=http://localhost:3001/api
```

### 2. Backend `.env` (in `server/` folder)
Create a new file named `.env` inside the `server` folder:
```env
PORT=3001
NODE_ENV=development
# Ask Team Lead for the real password!
MONGODB_URI=mongodb+srv://shraga013_db_user:YOUR_PASSWORD_HERE@cluster0.mongodb.net/daily-appreciation-test?retryWrites=true&w=majority
JWT_SECRET=test-secret-key-123
FRONTEND_URL=http://localhost:5173
```

---

## Phase 5: Run the App

You need to run both the backend and frontend. In Antigravity, you can open multiple terminal tabs.

**Terminal 1: Backend**
```bash
cd server
npm run dev
```
*Wait until you see "MongoDB connected".*

**Terminal 2: Frontend**
```bash
npm run dev
```
*Click the link shown (e.g., http://localhost:5173) to open the app preview.*

---

## Phase 6: Development Workflow

1.  **Chat with Antigravity:** Use the AI chat to ask for code changes, debugging, or explanations.
2.  **Git Workflow:**
    *   **Pull changes:** `git pull origin daily_test`
    *   **Make changes:** Edit code or ask AI to do it.
    *   **Commit & Push:**
        ```bash
        git add .
        git commit -m "Description of changes"
        git push origin daily_test
        ```

---

## Phase 7: Deploy to Test (Optional)

If you need to update the live test link:

1.  **Login:**
    ```bash
    gcloud auth login
    firebase login
    ```
2.  **Deploy Backend:**
    ```bash
    cd server
    gcloud run deploy daily-appreciation-backend-test --source . --platform managed --region us-central1 --allow-unauthenticated
    ```
3.  **Deploy Frontend:**
    ```bash
    npm run build
    firebase hosting:channel:deploy test-env
    ```
