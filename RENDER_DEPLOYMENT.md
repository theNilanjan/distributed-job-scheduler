# Render Deployment Guide

This guide covers deploying the JobScheduler application to Render, which is ideal for this project because it supports WebSockets, long-running processes, and includes MySQL hosting.

## Why Choose Render?

**Advantages over Vercel:**
- ✅ WebSockets supported (Socket.IO works out of the box)
- ✅ Long-running processes (workers can run continuously)
- ✅ Built-in MySQL hosting (free tier available)
- ✅ Simple deployment from GitHub
- ✅ Automatic SSL certificates
- ✅ Easy environment variable management

## Free MySQL Database Options

### Option 1: Render MySQL (Recommended - Built-in)
- **Free Tier:** 90 days free, then ~$7/month
- **Pros:** Integrated with Render, easy setup, automatic backups
- **Cons:** Not permanently free, but very affordable

### Option 2: PlanetScale (Best Free Option)
- **Free Tier:** 5GB storage, 1 billion rows read/month
- **Pros:** Serverless, excellent performance, permanently free
- **Cons:** Requires credit card verification

### Option 3: Railway
- **Free Tier:** $5 credit/month (lasts ~1-2 months)
- **Pros:** Simple setup, good developer experience
- **Cons:** Limited free tier

### Option 4: Neon (PostgreSQL Alternative)
- **Free Tier:** 0.5GB storage, unlimited projects
- **Pros:** Serverless PostgreSQL, excellent free tier
- **Cons:** PostgreSQL instead of MySQL (requires code changes)

## Step-by-Step Render Deployment

### 1. Set Up Free MySQL Database

#### Option A: Use Render's Built-in MySQL (Easiest)

1. Go to https://render.com/ and sign up
2. Click "New" → "Database" → "MySQL"
3. Name it: `job-scheduler-db`
4. Select region closest to you
5. Choose free tier (90 days free)
6. Click "Create Database"
7. Wait for database to be ready (~2-3 minutes)
8. Get connection details from dashboard:
   - Internal Database URL
   - External Database URL
   - Username, Password, Database Name

#### Option B: Use PlanetScale (Best Free Option)

1. Go to https://planetscale.com/ and sign up
2. Create a new database named `job_scheduler`
3. Create a production branch
4. Get connection string from dashboard
5. Format: `mysql://user:password@host/database`

### 2. Prepare Project for Render

#### Create render.yaml Configuration

Create `render.yaml` in the project root:

```yaml
services:
  # Backend API
  - type: web
    name: job-scheduler-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm run db:migrate && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5010
      - key: DB_HOST
        fromDatabase:
          name: job-scheduler-db
          property: host
      - key: DB_PORT
        value: 3306
      - key: DB_NAME
        fromDatabase：
          name: job-scheduler-db
          property: database
      - key: DB_USER
        fromDatabase:
          name: job-scheduler-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: job-scheduler-db
          property: password
      - key: JWT_ACCESS_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
      - key: API_BASE_URL
        value: https://job-scheduler-backend.onrender.com/api/v1
      - key: FRONTEND_URL
        value: https://job-scheduler-frontend.onrender.com

  # Worker Process
  - type: worker
    name: job-scheduler-worker
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm run worker
    envVars:
      - key: NODE_ENV
        value: production
      - key: DB_HOST
        fromDatabase:
          name: job-scheduler-db
          property: host
      - key: DB_PORT
        value: 3306
      - key: DB_NAME
        fromDatabase:
          name: job-scheduler-db
          property: database
      - key: DB_USER
        fromDatabase:
          name: job-scheduler-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: job-scheduler-db
          property: password
      - key: WORKER_CONCURRENCY
        value: 5
      - key: WORKER_POLL_INTERVAL_MS
        value: 2000

  # Frontend
  - type: web
    name: job-scheduler-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://job-scheduler-backend.onrender.com/api/v1
      - key: VITE_SOCKET_URL
        value: https://job-scheduler-backend.onrender.com

databases:
  - name: job-scheduler-db
    databaseName: job_scheduler
    user: jobscheduler
```

#### Update Backend for Render

Update `backend/package.json` to ensure proper scripts:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "worker": "node src/worker/start.js",
    "db:migrate": "sequelize db:migrate",
    "db:seed": "sequelize db:seed:all"
  }
}
```

### 3. Deploy to Render

#### Option A: Via Render Dashboard (Recommended)

1. Go to https://render.com/ and sign up/login
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the `distributed-job-scheduler` repository
5. Configure each service:

**Backend Service:**
- Name: `job-scheduler-backend`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm run db:migrate && npm start`
- Instance Type: Free (or $7/month for better performance)

**Worker Service:**
- Name: `job-scheduler-worker`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm run worker`
- Instance Type: Free

**Frontend Service:**
- Name: `job-scheduler-frontend`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Instance Type: Free

6. Add Environment Variables for each service:

**Backend Environment Variables:**
```
NODE_ENV=production
PORT=5010
DB_HOST=your-db-host.com
DB_PORT=3306
DB_NAME=job_scheduler
DB_USER=your_username
DB_PASSWORD=your_password
JWT_ACCESS_SECRET=your_32_char_secret
JWT_REFRESH_SECRET=your_32_char_secret
API_BASE_URL=https://job-scheduler-backend.onrender.com/api/v1
FRONTEND_URL=https://job-scheduler-frontend.onrender.com
```

**Worker Environment Variables:**
```
NODE_ENV=production
DB_HOST=your-db-host.com
DB_PORT=3306
DB_NAME=job_scheduler
DB_USER=your_username
DB_PASSWORD=your_password
WORKER_CONCURRENCY=5
WORKER_POLL_INTERVAL_MS=2000
```

**Frontend Environment Variables:**
```
VITE_API_BASE_URL=https://job-scheduler-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://job-scheduler-backend.onrender.com
```

#### Option B: Automatic Deployment via render.yaml

1. Push `render.yaml` to your GitHub repository
2. Go to Render dashboard
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml`
6. Review and click "Apply Blueprint"

### 4. Set Up Database

#### If Using Render MySQL:

1. Go to Render dashboard
2. Click "New" → "Database" → "MySQL"
3. Name it `job-scheduler-db`
4. Select free tier
5. Click "Create"
6. Copy the Internal Database URL
7. Update your backend service environment variables to use Render's database

#### If Using PlanetScale:

1. Create PlanetScale database
2. Get connection string
3. Add to backend environment variables:
```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_NAME=job_scheduler
DB_USER=your_planetscale_user
DB_PASSWORD=your_planetscale_password
```

### 5. Run Database Migrations

Render will automatically run migrations on deployment if you include them in the start command:

```bash
# Backend start command
npm run db:migrate && npm start
```

Alternatively, run migrations manually via Render shell:

1. Go to backend service in Render dashboard
2. Click "Shell" tab
3. Run: `npm run db:migrate`

### 6. Configure Socket.IO

Render supports WebSockets natively, so Socket.IO works out of the box:

```javascript
// backend/src/server.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});
```

### 7. Test Deployment

```bash
# Test backend health
curl https://job-scheduler-backend.onrender.com/api/v1/health

# Test frontend
# Open https://job-scheduler-frontend.onrender.com
```

## Cost Breakdown

### Free Tier (Render)
- **Web Services:** Free (with spin-up/down)
- **Worker Services:** Free (with spin-up/down)
- **MySQL Database:** 90 days free, then ~$7/month

### Free Tier (PlanetScale)
- **Database:** 5GB storage, 1 billion rows read/month
- **Cost:** $0 permanently

### Total Monthly Cost:
- With Render MySQL: ~$7/month (after 90-day trial)
- With PlanetScale: $0 (permanently free)

## Advantages of Render Deployment

1. **WebSockets Work** - Socket.IO real-time features work perfectly
2. **Workers Run Continuously** - Worker processes can run 24/7
3. **Integrated Database** - Easy database setup and management
4. **Automatic SSL** - HTTPS certificates provided automatically
5. **Simple Deployment** - One-click deployment from GitHub
6. **Environment Variables** - Easy management in dashboard
7. **Logs** - Built-in log viewing and monitoring

## Troubleshooting

### Database Connection Issues

```bash
# Test connection from Render shell
# Go to backend service → Shell
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME

# Check if PlanetScale allows connections from Render IPs
# PlanetScale dashboard → Settings → Access Control
```

### Worker Not Processing Jobs

```bash
# Check worker logs in Render dashboard
# Ensure worker service is running
# Verify database connection
# Check WORKER_CONCURRENCY setting
```

### Frontend Not Connecting to Backend

```bash
# Check CORS configuration
# Verify VITE_API_BASE_URL is correct
# Check backend service is running
# Test backend health endpoint
```

### WebSocket Connection Issues

```bash
# Check Socket.IO configuration
# Verify FRONTEND_URL in backend CORS
# Check Render allows WebSocket connections
# Test with polling fallback
```

## Recommended Architecture for Render

```
Frontend (Render Web Service)
    ↓
Backend API (Render Web Service) ← Socket.IO works
    ↓
MySQL Database (Render MySQL or PlanetScale)
    ↓
Worker Process (Render Worker Service) ← Runs continuously
```

## Comparison: Render vs Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| WebSockets | ✅ Native support | ❌ Not supported |
| Long-running processes | ✅ Workers run 24/7 | ❌ Serverless only |
| MySQL hosting | ✅ Built-in | ❌ External required |
| Free tier | ✅ 90 days free | ✅ Permanently free |
| Deployment complexity | ⭐ Simple | ⭐⭐ Moderate |
| Cold starts | ❌ None (always on) | ✅ Fast cold starts |
| Best for | Full-stack apps | Frontend/API only |

## Migration from Vercel to Render

If you started with Vercel and want to switch to Render:

1. Create Render account
2. Set up database on Render or PlanetScale
3. Deploy services to Render
4. Update frontend environment variables
5. Test all functionality
6. Update DNS to point to Render
7. Cancel Vercel deployment

## Resources

- Render Documentation: https://render.com/docs
- PlanetScale Documentation: https://planetscale.com/docs
- Render Free Tier: https://render.com/pricing
- Render Blueprint: https://render.com/docs/blueprint-spec

## Quick Start Command

```bash
# Deploy entire stack with one command (using render.yaml)
# After pushing render.yaml to GitHub:
# 1. Go to https://render.com/blueprints
# 2. Connect your repository
# 3. Click "Apply Blueprint"
# 4. Done!
```

## Conclusion

Render is the recommended platform for this JobScheduler project because:
- Socket.IO real-time features work out of the box
- Worker processes can run continuously
- Integrated MySQL hosting (or easy PlanetScale integration)
- Simple deployment process
- Affordable pricing (free tier available)
