# Git Installation Guide for Windows

## Step 1: Download Git

1. Go to: https://git-scm.com/download/win
2. Download will start automatically (Git for Windows)
3. Run the installer when download completes

## Step 2: Install Git

1. Click "Next" through the installer
2. **Important settings:**
   - **Select Components**: Keep defaults
   - **Default editor**: Choose your preferred editor (VS Code recommended)
   - **PATH environment**: Choose "Git from the command line and also from 3rd-party software"
   - **Line ending conversions**: Choose "Checkout Windows-style, commit Unix-style"
   - Keep other defaults

3. Click "Install"
4. Click "Finish"

## Step 3: Verify Installation

Open a **NEW** PowerShell window and run:
```powershell
git --version
```

Should show: `git version 2.x.x.windows.x`

## Step 4: Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 5: Ready to Push!

Once Git is installed, let me know and I'll continue with pushing your code to GitHub.

## Quick Commands We'll Use:

```powershell
git init                    # Initialize repository
git add .                   # Stage all files
git commit -m "message"     # Commit changes
git remote add origin URL   # Connect to GitHub
git push -u origin main     # Push to GitHub
```
