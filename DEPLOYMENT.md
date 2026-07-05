# Deployment Guide

This guide covers deploying the JobScheduler application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Hosting Options](#database-hosting-options)
3. [Environment Configuration](#environment-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Platform Deployment](#cloud-platform-deployment)
6. [Security Best Practices](#security-best-practices)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured (for production)
- SSL certificate (for production HTTPS)
- MySQL database hosting service

## Database Hosting Options

### Option 1: Managed MySQL Services (Recommended for Production)

#### AWS RDS for MySQL
```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier jobscheduler-db \
  --db-instance-class db.t3.micro \
  --engine MySQL \
  --master-username jobscheduler \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxx
```

**Connection Details:**
- Host: `jobscheduler-db.xxxx.us-east-1.rds.amazonaws.com`
- Port: 3306
- Update `.env.production` with these values

#### Google Cloud SQL for MySQL
```bash
# Create Cloud SQL instance via Google Cloud Console
gcloud sql instances create jobscheduler-db \
  --tier=db-f1-micro \
  --region=us-central1 \
  --database-version=MYSQL_8_0
```

#### DigitalOcean Managed MySQL Database
```bash
# Create via DigitalOcean Control Panel
# Provides connection string like:
# mysql://doadmin:password@jobscheduler-db-do-user-12345.db.ondigitalocean.com:25060/defaultdb
```

#### Azure Database for MySQL
```bash
# Create via Azure Portal or CLI
az mysql server create \
  --name jobscheduler-db \
  --resource-group myResourceGroup \
  --location eastus \
  --admin-user jobscheduler \
  --admin-password YOUR_SECURE_PASSWORD
```

### Option 2: Self-Hosted MySQL (Not Recommended for Production)

If you must self-host, use the included Docker MySQL container for development only. For production, consider:
- Separate VM with MySQL installed
- Proper backup strategy implemented
- Security hardening applied
- Monitoring and alerting configured

### Option 3: Free MySQL Hosting (Development Only)

#### PlanetScale
- Free tier available
- Serverless MySQL
- Good for development/testing
- Connection string provided after setup

#### Railway
- Simple MySQL hosting
- Free tier available
- Easy integration with deployment

#### Supabase (PostgreSQL alternative)
- Free tier available
- PostgreSQL-based
- Consider if you're open to PostgreSQL instead of MySQL

## Environment Configuration

### 1. Copy Environment Template
```bash
cp .env.production .env
```

### 2. Update Environment Variables
Edit `.env` with your production values:

```bash
# Database Configuration (use your managed MySQL service)
DB_HOST=your-mysql-host.rds.amazonaws.com
DB_PORT=3306
DB_NAME=job_scheduler
DB_USER=jobscheduler
DB_PASSWORD=your_secure_password_here

# API Configuration
API_BASE_URL=https://your-domain.com/api/v1
FRONTEND_URL=https://your-domain.com

# Security (CHANGE THESE!)
JWT_ACCESS_SECRET=your_jwt_access_secret_minimum_16_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_minimum_16_characters
```

### 3. Generate Secure Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Docker Deployment

### Local Development
```bash
# Build and start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run db:migrate

# Seed database (development only)
docker-compose exec backend npm run db:seed

# View logs
docker-compose logs -f
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start production services
docker-compose -f docker-compose.yml up -d

# Check service status
docker-compose ps
```

## Cloud Platform Deployment

### Deploy to AWS

#### Using ECS (Elastic Container Service)
1. Push Docker images to ECR
2. Create ECS task definitions
3. Configure load balancer
4. Set up auto-scaling

#### Using EC2
1. Launch EC2 instance
2. Install Docker
3. Clone repository
4. Configure environment variables
5. Run `docker-compose up -d`

### Deploy to Google Cloud

#### Using Cloud Run
```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT-ID/backend ./backend
gcloud builds submit --tag gcr.io/PROJECT-ID/frontend ./frontend

# Deploy services
gcloud run deploy backend --image gcr.io/PROJECT-ID/backend --platform managed
gcloud run deploy frontend --image gcr.io/PROJECT-ID/frontend --platform managed
```

### Deploy to DigitalOcean

#### Using App Platform
1. Connect GitHub repository
2. Configure build settings
3. Set environment variables
4. Deploy

#### Using Droplets
1. Create Droplet
2. SSH into server
3. Install Docker
4. Clone repository
5. Configure environment
6. Run `docker-compose up -d`

## Security Best Practices

### 1. Use HTTPS
```nginx
# nginx.conf for SSL
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 2. Environment Variables
- Never commit `.env` files
- Use secrets management (AWS Secrets Manager, etc.)
- Rotate secrets regularly
- Use strong, unique passwords

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict access by IP
- Regular backups
- Monitor for suspicious activity

### 4. API Security
- Rate limiting enabled
- CORS properly configured
- Input validation
- SQL injection prevention (Sequelize handles this)
- XSS prevention

### 5. Container Security
- Use official Docker images
- Keep images updated
- Scan for vulnerabilities
- Use non-root users in containers

## Monitoring and Maintenance

### 1. Application Monitoring
- Use logging (Winston configured)
- Set up error tracking (Sentry, etc.)
- Monitor performance (APM tools)
- Set up alerts

### 2. Database Monitoring
- Monitor connection pool
- Track query performance
- Monitor disk usage
- Set up backup alerts

### 3. Health Checks
```bash
# Backend health check
curl https://your-domain.com/api/v1/health

# Database connection check
docker-compose exec backend npm run db:check
```

### 4. Backup Strategy
```bash
# Database backup (for managed services, use provider's backup)
# For self-hosted:
docker-compose exec mysql mysqldump -u root -p job_scheduler > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u root -p job_scheduler < backup.sql
```

### 5. Updates and Maintenance
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate
```

## Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
docker-compose ps mysql

# Check logs
docker-compose logs mysql

# Test connection
docker-compose exec backend npm run db:check
```

### Container Issues
```bash
# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Rebuild service
docker-compose up -d --build [service-name]
```

### Performance Issues
- Check resource usage: `docker stats`
- Review database query performance
- Check for memory leaks
- Monitor network latency

## Cost Optimization

### AWS
- Use Reserved Instances for predictable workloads
- Use Spot Instances for workers
- Enable auto-scaling
- Monitor and optimize RDS storage

### Google Cloud
- Use preemptible VMs for workers
- Configure proper machine types
- Use Cloud SQL auto-scaling
- Monitor costs with billing alerts

### DigitalOcean
- Choose appropriate droplet sizes
- Use managed databases for reliability
- Monitor resource usage
- Use load balancers for scaling

## Support and Resources

- Documentation: `/docs`
- API Documentation: `http://localhost:5010/api-docs`
- Issue Tracker: GitHub Issues
- Community: [Discord/Slack channel]
