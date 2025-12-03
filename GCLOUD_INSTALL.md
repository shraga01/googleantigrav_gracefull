# Google Cloud CLI Installation - Quick Guide

## Step 1: Download

Go to: **https://cloud.google.com/sdk/docs/install-sdk#windows**

Or direct download: **https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe**

## Step 2: Run Installer

1. Run the downloaded `GoogleCloudSDKInstaller.exe`
2. Click "Yes" if prompted by Windows
3. Follow the installation wizard:
   - ✅ Check "Run 'gcloud init'" at the end
   - ✅ Keep other defaults
4. Click "Finish"

## Step 3: Initialize (will open automatically)

A PowerShell window will open and ask:

1. **"Log in with your Google account?"** → Type `Y` and press Enter
2. Browser opens → Login with your Google Cloud account
3. **"Pick cloud project to use"** → Select your project (or create new)
4. **"Configure default region?"** → Type `Y` → Choose region close to you (e.g., `us-central1`)

## Step 4: Verify Installation

Open a **NEW** PowerShell window and run:
```powershell
gcloud --version
```

Should show:
```
Google Cloud SDK 4xx.x.x
...
```

✅ **You're ready to deploy!**

---

## After Installation

Come back and let me know it's installed, then we'll continue with deployment!
