# 🚀 Deploy JobPilot AI to Render

This guide walks you through deploying JobPilot AI to [Render](https://render.com).

## Prerequisites

- A [Render account](https://render.com) (free to sign up)
- Your code pushed to GitHub/GitLab
- (Optional) OpenAI API key for AI features

## Method 1: One-Click Deploy (Recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - JobPilot AI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jobpilot-ai.git
git push -u origin main
```

### Step 2: Deploy with Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file
5. Click **"Apply"**

This will automatically create:
- ✅ Web Service (Next.js app)
- ✅ PostgreSQL Database
- ✅ Environment variables

### Step 3: Add API Keys

After deployment, go to your Web Service → **Environment**:

1. Find `OPENAI_API_KEY` 
2. Click "Edit" and add your key: `sk-...`
3. Click "Save Changes"

The service will automatically redeploy.

---

## Method 2: Manual Setup

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `jobpilot-db`
   - **Database**: `jobpilot`
   - **User**: `jobpilot`
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait for it to be ready, then copy the **Internal Database URL**

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `jobpilot-ai`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

### Step 3: Add Environment Variables

In the Web Service settings, add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (paste Internal Database URL from Step 1) |
| `SESSION_SECRET` | (click "Generate" for random value) |
| `ENCRYPTION_KEY` | (click "Generate" for random value) |
| `OPENAI_API_KEY` | `sk-...` (your OpenAI key) |
| `NEXT_PUBLIC_APP_URL` | `https://jobpilot-ai.onrender.com` (your Render URL) |

### Step 4: Deploy

Click **"Create Web Service"** — Render will:
1. Clone your repository
2. Install dependencies
3. Push database schema
4. Build the Next.js app
5. Start the server

---

## 🗄️ Database Setup

The database schema is automatically applied during the build process via the `render-build` script.

If you need to manually apply schema changes:

```bash
# Using Render Shell (in Dashboard → Shell)
npx drizzle-kit push
```

---

## ⚙️ Environment Variables Reference

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-set if using Blueprint) |
| `SESSION_SECRET` | Random string for session encryption |
| `ENCRYPTION_KEY` | Random string for data encryption |

### For AI Features

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (get from [platform.openai.com](https://platform.openai.com)) |

### Optional

| Variable | Description |
|----------|-------------|
| `GOOGLE_AI_API_KEY` | Alternative: Google Gemini API |
| `ANTHROPIC_API_KEY` | Alternative: Claude API |
| `CRON_SECRET` | Secret for cron endpoint authentication |

---

## 🔄 Background Jobs (Optional)

The free tier doesn't support background workers. Options:

### Option A: Render Cron Jobs (Paid)

1. Upgrade to Starter plan ($7/month)
2. Go to **"Cron Jobs"** → **"New Cron Job"**
3. Configure:
   - **Command**: `curl -X GET https://your-app.onrender.com/api/cron/job-scan`
   - **Schedule**: `0 */2 * * *` (every 2 hours)

### Option B: External Cron Service (Free)

Use [cron-job.org](https://cron-job.org) (free):

1. Create account at cron-job.org
2. Create new cron job:
   - **URL**: `https://your-app.onrender.com/api/cron/job-scan`
   - **Schedule**: Every 2 hours
   - **Method**: GET

### Option C: Manual Scanning

Without background jobs, users can manually trigger scans from the dashboard by clicking "Run Job Scan".

---

## 🌐 Custom Domain (Optional)

1. Go to your Web Service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `jobpilot.yourdomain.com`)
3. Update DNS:
   - Add CNAME record pointing to `your-app.onrender.com`
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## 📊 Monitoring

### Logs
- Go to **Web Service** → **Logs**
- View real-time application logs

### Metrics
- Go to **Web Service** → **Metrics**
- Monitor CPU, Memory, and Requests

### Health Check
- Render automatically monitors `/api/health`
- Restarts service if unhealthy

---

## 💰 Pricing

### Free Tier Includes:
- ✅ 750 hours/month web service
- ✅ PostgreSQL database (90 days, then requires upgrade)
- ✅ 100 GB bandwidth
- ✅ Auto-deploy from Git

### Limitations:
- ❌ Spins down after 15 min inactivity (cold starts ~30s)
- ❌ No background workers
- ❌ Database expires after 90 days

### Recommended: Starter Plan ($7/month)
- ✅ Always-on (no cold starts)
- ✅ Background workers
- ✅ Persistent database

---

## 🔧 Troubleshooting

### Build Fails

Check build logs for errors. Common issues:

```bash
# Missing dependencies
npm install

# TypeScript errors
npm run typecheck

# Database connection
# Ensure DATABASE_URL is set correctly
```

### Database Connection Issues

1. Verify DATABASE_URL is the **Internal** URL (not External)
2. Check database is in the same region as web service
3. Ensure database is running (not suspended)

### Cold Starts (Free Tier)

Free tier services spin down after 15 minutes. First request after spin-down takes ~30 seconds.

**Solutions:**
- Upgrade to Starter plan ($7/month)
- Use a ping service to keep it warm (not recommended, wastes resources)

### Environment Variables Not Working

1. Check variables are saved (not just typed)
2. Redeploy after changing variables
3. For `NEXT_PUBLIC_*` variables, you must rebuild (not just restart)

---

## 🚀 Post-Deployment Checklist

- [ ] App loads at `https://your-app.onrender.com`
- [ ] Health check passes: `/api/health` returns `{"status":"ok"}`
- [ ] Database connected: Can create profile in onboarding
- [ ] AI working: Job scores are calculated (requires `OPENAI_API_KEY`)
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Background job scanning set up

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **JobPilot Issues**: Create an issue in your GitHub repo

---

**Happy job hunting! 🎯**
