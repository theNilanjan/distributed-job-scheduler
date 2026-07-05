# Quick Start Deployment Guide

This guide helps you choose the best deployment option and get started quickly.

## Recommended: Render + PlanetScale (Easiest & Free)

**Why this combination:**
- ✅ Render supports WebSockets (Socket.IO works)
- ✅ Render supports long-running workers
- ✅ PlanetScale is permanently free
- ✅ Simple deployment from GitHub
- ✅ Total cost: $0/month

## Step-by-Step: Render + PlanetScale (15 minutes)

### 1. Set Up PlanetScale Database (5 minutes)

1. Go to https://planetscale.com/ and sign up
2. Click "Create a database"
3. Name it: `job_scheduler`
4. Region: Choose closest to you
5. Click "Create database"
6. Click "Connect" → "General" → "Generate password"
7. Copy the connection string:
   ```
   mysql://user:password@aws.connect.psdb.cloud/job_scheduler
   ```

### 2. Deploy to Render (10 minutes)

1. Go to https://render.com/ and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `theNilanjan/distributed-job-scheduler`
4. Configure Backend Service:
   - Name: `job-scheduler-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm run db:migrate && npm start`
   - Instance Type: Free

5. Add Backend Environment Variables:
   ```
   NODE_ENV=production
   PORT=5010
   DB_HOST=aws.connect.psdb.cloud
   DB_PORT=3306
   DB_NAME=job_scheduler
   DB_USER=your_planetscale_user
   DB_PASSWORD=your_planetscale_password
   JWT_ACCESS_SECRET=generate_32_char_secret
   JWT_REFRESH_SECRET=generate_32_char_secret
   API_BASE_URL=https://job-scheduler-backend.onrender.com/api/v1
   FRONTEND_URL=https://job-scheduler-frontend.onrender.com
   ```

6. Deploy Worker Service:
   - Name: `job-scheduler-worker`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm run worker`
   - Instance Type: Free

7. Add Worker Environment Variables:
   ```
   NODE_ENV=production
   DB_HOST=aws.connect.psdb.cloud
   DB_PORT=3306
   DB_NAME=job_scheduler
   DB_USER=your_planetscale_user
   DB_PASSWORD=your_planetscale_password
   WORKER_CONCURRENCY=5
   WORKER_POLL_INTERVAL_MS=2000
   ```

8. Deploy Frontend Service:
   - Name: `job-scheduler-frontend`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Instance Type: Free

9. Add Frontend Environment Variables:
   ```
   VITE_API_BASE_URL=https://job-scheduler-backend.onrender.com/api/v1
   VITE_SOCKET_URL=https://job-scheduler-backend.onrender.com
   ```

10. Wait for deployment (~5 minutes)
11. Access your app at: `https://job-scheduler-frontend.onrender.com`

## Alternative: Vercel + PlanetScale (No WebSockets)

**Use this if:**
- You prefer Vercel's interface
- You don't need real-time Socket.IO features
- You want permanently free hosting

**Limitations:**
- ❌ Socket.IO won't work (no WebSockets)
- ❌ Workers won't run continuously
- ❌ Need to use polling instead of real-time updates

See `VERCEL_DEPLOYMENT.md` for detailed steps.

## Alternative: Render + Render MySQL (Easiest Setup)

**Use this if:**
- You want everything in one platform
- You don't mind paying ~$7/month after 90 days
- You want the simplest setup

**Cost:** Free for 90 days, then ~$7/month

See `RENDER_DEPLOYMENT.md` for detailed steps.

## Free MySQL Hosting Comparison

| Provider | Free Tier | Storage | Best For |
|----------|-----------|---------|----------|
| **PlanetScale** | ✅ Permanent | 5GB | Best overall choice |
| **Render MySQL** | ❌ 90 days | 1GB | Easiest with Render |
| **Railway** | ❌ $5 credit | 1GB | Good for testing |
| **Neon** | ✅ Permanent | 0.5GB | PostgreSQL alternative |

## Generate Secure Secrets

```bash
# Generate JWT secrets (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator: https://randomkeygen.com/
```

## Platform Comparison

| Feature | Render | Vercel |
|---------|--------|--------|
| **WebSockets** | ✅ Yes | ❌ No |
| **Workers** | ✅ 24/7 | ❌ Serverless only |
| **MySQL** | ✅ Built-in | ❌ External only |
| **Free Tier** | ✅ Yes | ✅ Yes |
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Best For** | Full-stack apps | Frontend/API |

## My Recommendation

**For this JobScheduler project: Render + PlanetScale**

**Why:**
1. Socket.IO real-time features work perfectly
2. Worker processes run continuously
3. PlanetScale is permanently free
4. Simple deployment from GitHub
5. Total cost: $0/month

## Next Steps

1. **Choose your platform:** Render (recommended) or Vercel
2. **Set up database:** PlanetScale (recommended) or Render MySQL
3. **Follow the deployment guide:**
   - Render: `RENDER_DEPLOYMENT.md`
   - Vercel: `VERCEL_DEPLOYMENT.md`
4. **Deploy and test your application**

## Need Help?

- **Render Documentation:** https://render.com/docs
- **PlanetScale Documentation:** https://planetscale.com/docs
- **Vercel Documentation:** https://vercel.com/docs
- **Project Issues:** GitHub Issues

## Troubleshooting

**Database connection fails:**
- Check PlanetScale allows connections from Render IPs
- Verify connection string format
- Test connection locally first

**Worker not processing jobs:**
- Check worker logs in Render dashboard
- Verify WORKER_CONCURRENCY setting
- Ensure database connection is working

**Frontend can't connect to backend:**
- Check VITE_API_BASE_URL is correct
- Verify CORS configuration
- Test backend health endpoint

**Socket.IO not working:**
- Use Render (Vercel doesn't support WebSockets)
- Check FRONTEND_URL in backend CORS
- Verify Socket.IO configuration
