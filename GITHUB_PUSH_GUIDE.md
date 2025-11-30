# Push to GitHub - Step by Step

## ⚠️ Important: Open a NEW PowerShell Window

Git is installed, but your current PowerShell session doesn't have it in the PATH yet.

**You need to:**
1. Close this PowerShell window
2. Open a **NEW** PowerShell window
3. Navigate back to your project:
   ```powershell
   cd C:\Users\OSUser\.gemini\antigravity\playground\obsidian-equinox\daily-appreciation-app
   ```

## Step 1: Configure Git (One-Time Setup)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 2: Initialize Git Repository

```powershell
git init
git add .
git commit -m "Initial commit - Daily Appreciation Web App"
```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `daily-appreciation-app`
3. Description: "Daily gratitude practice web application"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 4: Connect and Push to GitHub

GitHub will show you commands. Use these:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/daily-appreciation-app.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 5: Verify

Go to your GitHub repository URL and you should see all your code!

---

## Quick Reference

After the initial push, future updates are simple:

```powershell
git add .
git commit -m "Description of changes"
git push
```

---

## Troubleshooting

**"git is not recognized"**
- Open a NEW PowerShell window (current one doesn't have Git in PATH)

**"Permission denied (publickey)"**
- Use HTTPS URL instead of SSH
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**"Repository not found"**
- Check the repository URL
- Make sure you're logged into GitHub
- Verify repository exists

---

## Next Steps After Push

Once your code is on GitHub:
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Both will auto-deploy on future git pushes!
