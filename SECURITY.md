# Security Configuration Guide

This guide covers security best practices for deploying the JobScheduler application.

## Database Security

### Managed MySQL Services (Recommended)

For production, always use managed MySQL services that provide:

- **Automatic backups**
- **Point-in-time recovery**
- **Security patches**
- **SSL/TLS encryption**
- **Network isolation**
- **Monitoring and alerting**

### Recommended Providers

1. **AWS RDS for MySQL**
   - VPC isolation
   - Encryption at rest and in transit
   - Automated backups
   - Multi-AZ deployment for high availability

2. **Google Cloud SQL for MySQL**
   - Automatic storage increases
   - High availability configuration
   - SSL/TLS connections
   - Private IP access

3. **DigitalOcean Managed MySQL**
   - Simple setup
   - Automatic backups
   - High availability option
   - VPC networking

### Database Connection Security

```bash
# Enable SSL connections in environment
DB_SSL=true
DB_CA_CERT=/path/to/ca-cert.pem
```

### Database User Permissions

Create separate users with minimal required permissions:

```sql
-- Application user (read/write to specific database)
CREATE USER 'jobscheduler'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX ON job_scheduler.* TO 'jobscheduler'@'%';

-- Read-only user for reporting
CREATE USER 'jobscheduler_readonly'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT ON job_scheduler.* TO 'jobscheduler_readonly'@'%';
```

## Application Security

### Environment Variables

Never commit sensitive data to version control:

```bash
# .env (never commit)
JWT_ACCESS_SECRET=your_jwt_access_secret_minimum_16_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_minimum_16_characters
DB_PASSWORD=your_secure_database_password
```

### Generate Secure Secrets

```bash
# Generate JWT secrets (32+ bytes recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate database passwords
openssl rand -base64 32
```

### JWT Configuration

```javascript
// backend/src/config/env.js
JWT_ACCESS_SECRET: z.string().min(32), // Increased from 16 to 32
JWT_REFRESH_SECRET: z.string().min(32),
JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
```

## API Security

### Rate Limiting

Rate limiting is configured in `backend/src/middlewares/rateLimiter.js`:

```javascript
// Adjust limits based on your needs
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### CORS Configuration

```javascript
// backend/src/app.js
app.use(cors({ 
  origin: env.FRONTEND_URL, // Only allow your frontend domain
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Input Validation

All inputs are validated using Zod schemas in `backend/src/schemas/`:

```javascript
// Example schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

### SQL Injection Prevention

Sequelize ORM automatically prevents SQL injection through parameterized queries:

```javascript
// Safe - Sequelize handles escaping
const user = await User.findOne({ where: { email: userInput } });

// Never use raw queries with user input
const user = await sequelize.query(`SELECT * FROM users WHERE email = '${userInput}'`); // UNSAFE
```

## Container Security

### Docker Security Best Practices

1. **Use official base images**
2. **Run as non-root user**
3. **Minimize image size**
4. **Scan for vulnerabilities**
5. **Keep images updated**

### Run as Non-Root User

```dockerfile
# backend/Dockerfile
FROM node:22-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs
```

### Security Scanning

```bash
# Scan Docker images for vulnerabilities
docker scan job-scheduler-backend:latest
docker scan job-scheduler-frontend:latest

# Use Trivy for more comprehensive scanning
trivy image job-scheduler-backend:latest
```

## Network Security

### Firewall Configuration

```bash
# Only allow necessary ports
# Backend: 5010
# Frontend: 80/443
# Database: 3306 (only from backend)

# Example UFW rules
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from backend_ip to any port 3306
ufw enable
```

### SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    # Strong SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

## Secrets Management

### Environment-Based Secrets

For development, use `.env` files. For production, use:

1. **AWS Secrets Manager**
2. **Google Secret Manager**
3. **Azure Key Vault**
4. **HashiCorp Vault**

### Example: AWS Secrets Manager

```javascript
// Load secrets from AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return JSON.parse(data.SecretString);
}

const secrets = await getSecret('jobscheduler/production');
```

## Monitoring and Logging

### Security Logging

```javascript
// backend/src/utils/logger.js
// Configure Winston for security logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log security events
securityLogger.info({
  event: 'login_attempt',
  email: req.body.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true
});
```

### Intrusion Detection

Monitor for:
- Failed login attempts
- Unusual API usage patterns
- Database connection attempts from unknown IPs
- Large data exports

## Backup and Recovery

### Database Backups

```bash
# Automated daily backups
0 2 * * * docker-compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} job_scheduler > /backups/daily_$(date +\%Y\%m\%d).sql

# Weekly full backups
0 3 * * 0 docker-compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} --all-databases > /backups/weekly_$(date +\%Y\%m\%d).sql
```

### Disaster Recovery

1. **Test backup restoration regularly**
2. **Document recovery procedures**
3. **Store backups in multiple locations**
4. **Encrypt backup files**

## Compliance

### GDPR Considerations

- Implement data retention policies
- Provide data export functionality
- Support data deletion requests
- Log consent and privacy settings

### SOC 2 Considerations

- Implement access controls
- Enable audit logging
- Regular security assessments
- Incident response procedures

## Security Checklist

### Pre-Deployment

- [ ] All secrets replaced with strong values
- [ ] SSL/TLS certificates configured
- [ ] Firewall rules configured
- [ ] Database backups enabled
- [ ] Monitoring and alerting configured
- [ ] Security scanning completed
- [ ] Access controls reviewed
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation tested

### Post-Deployment

- [ ] Monitor for security events
- [ ] Regular security updates
- [ ] Periodic security audits
- [ ] Backup restoration testing
- [ ] Access review
- [ ] Performance monitoring

## Incident Response

### Security Incident Steps

1. **Identify** - Detect and confirm the incident
2. **Contain** - Isolate affected systems
3. **Eradicate** - Remove the threat
4. **Recover** - Restore normal operations
5. **Lessons** - Document and improve

### Emergency Contacts

- Security Team: [contact]
- Database Administrator: [contact]
- DevOps Team: [contact]
- Legal: [contact]

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
