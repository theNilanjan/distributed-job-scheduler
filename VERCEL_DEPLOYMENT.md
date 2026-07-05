# Vercel Deployment Guide

This guide covers deploying the JobScheduler application to Vercel.

## Prerequisites

- Vercel account (free tier available)
- GitHub account with project pushed
- Free MySQL database hosting (see recommendations below)

## Free MySQL Database Options

### Option 1: PlanetScale (Recommended)
- **Free Tier:** 5GB storage, 1 billion rows read/month
- **Pros:** Serverless, excellent performance, easy setup
- **Cons:** Requires credit card for verification

```bash
# Sign up at https://planetscale.com/
# Create a database
# Get connection string
# Format: mysql://user:password@host/database
```

### Option 2: Railway
- **Free Tier:** $5 credit/month (good for small projects)
- **Pros:** Simple setup, good developer experience
- **Cons:** Limited free tier

```bash
# Sign up at https://railway.app/
# Create MySQL database
# Get connection string from dashboard
```

### Option 3: Neon (PostgreSQL Alternative)
- **Free Tier:** 0.5GB storage, unlimited projects
- **Pros:** Serverless PostgreSQL, excellent free tier
- **Cons:** PostgreSQL instead of MySQL (requires code changes)

### Option 4: Supabase (PostgreSQL Alternative)
- **Free Tier:** 500MB database, 2GB file storage
- **Pros:** PostgreSQL, auth, storage included
- **Cons:** PostgreSQL instead of MySQL

## Step-by-Step Vercel Deployment

### 1. Set Up Free MySQL Database

#### Using PlanetScale (Recommended)

1. Go to https://planetscale.com/ and sign up
2. Create a new database named `job_scheduler`
3. Create a new branch for production
4. Get your connection string from the dashboard
5. Format: `mysql://user:password@host/database`

#### Using Railway

1. Go to https://railway.app/ and sign up
2. Click "New Project" → "Provision MySQL"
3. Get connection string from the database settings
4. Format: `mysql://user:password@host:port/database`

### 2. Prepare Project for Vercel

#### Create vercel.json Configuration

Create `vercel.json` in the project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "15mb"
      }
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Update Backend for Vercel

Create `backend/vercel.js`:

```javascript
const server = require('./src/server.js');

module.exports = server;
```

Update `backend/package.json`:

```json
{
  "scripts": {
    "start": "node vercel.js"
  }
}
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Go to https://vercel.com/ and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:

**Framework Preset:** Other
**Root Directory:** `./`
**Build Command:** (leave empty for now)
**Output Directory:** (leave empty)

5. Add Environment Variables:

```
NODE_ENV=production
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_NAME=job_scheduler
DB_USER=your_username
DB_PASSWORD=your_password
JWT_ACCESS_SECRET=your_jwt_secret_32_chars
JWT_REFRESH_SECRET=your_jwt_secret_32_chars
API_BASE_URL=https://your-project.vercel.app/api/v1
FRONTEND_URL=https://your-project.vercel.app
```

6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts
# - Link to existing project? No
# - Project name? job-scheduler
# - Directory? ./
# - Override settings? Yes
```

### 4. Configure Database Migrations

Since Vercel is serverless, you need to handle migrations differently:

#### Option 1: Use Vercel Cron Jobs

Create `backend/api/migrate.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { sequelize } = require('../src/models');
    await sequelize.sync({ alter: true });
    res.status(200).json({ success: true, message: 'Database migrated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### Option 2: Run Migration Locally Before Deploy

```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="mysql://user:password@host/database"

# Run migrations
cd backend
npm run db:migrate
```

### 5. Deploy Frontend Separately (Alternative Approach)

For better performance, deploy frontend and backend separately:

#### Deploy Backend as API

1. Create `backend/vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/server.js"
    }
  ]
}
```

2. Deploy backend to Vercel (get URL: `backend-api.vercel.app`)

#### Deploy Frontend

1. Update `frontend/.env`:

```bash
VITE_API_BASE_URL=https://backend-api.vercel.app/api/v1
VITE_SOCKET_URL=https://backend-api.vercel.app
```

2. Deploy frontend to Vercel

### 6. Configure Socket.IO (Important)

Vercel doesn't support WebSockets natively. You have options:

#### Option 1: Use a Separate WebSocket Service

- Deploy backend worker to a service that supports WebSockets (Railway, Render)
- Use that service for Socket.IO

#### Option 2: Use Polling Instead of WebSockets

Update frontend to use polling:

```javascript
// frontend/src/lib/socket.js
export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'https://backend-api.vercel.app', {
      autoConnect: false,
      auth: () => ({ token: getAccessToken() }),
      transports: ['polling'] // Force polling
    });
  }
  return socket;
}
```

#### Option 3: Disable Real-time Features

Remove Socket.IO dependency and use polling for dashboard updates.

### 7. Set Up Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add all required variables:

```
# Database
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_NAME=job_scheduler
DB_USER=your_username
DB_PASSWORD=your_password

# Security
JWT_ACCESS_SECRET=your_32_char_secret
JWT_REFRESH_SECRET=your_32_char_secret

# API
API_BASE_URL=https://your-project.vercel.app/api/v1
FRONTEND_URL=https://your-project.vercel.app

# Node
NODE_ENV=production
```

### 8. Test Deployment

```bash
# Test backend API
curl https://your-project.vercel.app/api/v1/health

# Test frontend
# Open https://your-project.vercel.app in browser
```

## Limitations of Vercel Deployment

### Known Issues

1. **No WebSockets** - Vercel doesn't support WebSocket connections
   - Solution: Use polling or separate WebSocket service

2. **Serverless Functions** - Cold starts can affect performance
   - Solution: Use Vercel Pro for reserved instances

3. **Database Connections** - Limited connection pool
   - Solution: Use connection pooling (PlanetScale handles this well)

4. **Worker Processes** - Can't run long-running worker processes
   - Solution: Deploy worker separately to Railway/Render

5. **File System** - No persistent file system
   - Solution: Use object storage (Vercel Blob, AWS S3)

## Recommended Architecture for Vercel

```
Frontend (Vercel)
    ↓
Backend API (Vercel Serverless)
    ↓
MySQL Database (PlanetScale/Railway)
    ↓
Worker Process (Railway/Render - separate deployment)
```

## Cost Breakdown

### Free Tier (Vercel)
- 100GB bandwidth/month
- 6,000 minutes of execution/month
- Unlimited projects

### Free Tier (PlanetScale)
- 5GB storage
- 1 billion rows read/month
- Unlimited writes

### Total Monthly Cost: $0

## Troubleshooting

### Database Connection Issues

```bash
# Test connection locally with production credentials
mysql -h your-host -u your-user -p your-database

# Check if PlanetScale allows connections from Vercel IPs
# PlanetScale dashboard → Settings → Access Control
```

### Build Failures

```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Incorrect build command
# - Dependencies not installing
```

### Runtime Errors

```bash
# Check function logs in Vercel dashboard
# Common issues:
# - Database connection timeout
# - Missing environment variables
# - Lambda timeout (max 10s on free tier)
```

## Alternative: Deploy to Railway Instead

Railway supports:
- WebSockets (Socket.IO works)
- Long-running processes (workers)
- MySQL hosting included
- Simpler deployment

See `RENDER_DEPLOYMENT.md` for Railway deployment guide.

## Resources

- Vercel Documentation: https://vercel.com/docs
- PlanetScale Documentation: https://planetscale.com/docs
- Railway Documentation: https://docs.railway.app
