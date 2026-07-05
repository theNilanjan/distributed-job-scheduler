# JobScheduler Deployment Script for Windows
# This script helps deploy the application to production

Write-Host "🚀 JobScheduler Deployment Script" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Function to print colored output
function Print-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$message)
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Print-Error ".env file not found!"
    Write-Host "Please copy .env.production to .env and configure your environment variables."
    exit 1
}

Print-Success ".env file found"

# Check if Docker is installed
try {
    docker --version | Out-Null
    Print-Success "Docker is installed"
} catch {
    Print-Error "Docker is not installed!"
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Print-Success "Docker Compose is installed"
} catch {
    Print-Error "Docker Compose is not installed!"
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}

# Validate required environment variables
$requiredVars = @("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET")
$missingVars = @()

foreach ($var in $requiredVars) {
    if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($var))) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Print-Error "Missing required environment variables: $($missingVars -join ', ')"
    exit 1
}

Print-Success "Environment variables validated"

# Ask for deployment type
Write-Host ""
Write-Host "Select deployment type:"
Write-Host "1) Local development (with Docker MySQL)"
Write-Host "2) Production (with external MySQL)"
Write-Host ""
$deploymentType = Read-Host "Enter choice (1 or 2)"

if ($deploymentType -eq "1") {
    Write-Host ""
    Print-Warning "Deploying for local development..."
    docker-compose down
    docker-compose build
    docker-compose up -d
    Print-Success "Local development deployment complete!"
    Write-Host "Access the application at http://localhost:5173"
    
} elseif ($deploymentType -eq "2") {
    Write-Host ""
    Print-Warning "Deploying for production..."
    
    # Backup existing database if using local MySQL
    if ($env:DB_HOST -eq "mysql") {
        Print-Warning "You're using local MySQL. Consider using a managed MySQL service for production."
        $continueLocal = Read-Host "Continue anyway? (y/n)"
        if ($continueLocal -ne "y") {
            Write-Host "Deployment cancelled."
            exit 0
        }
    }
    
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build
    docker-compose -f docker-compose.prod.yml up -d
    Print-Success "Production deployment complete!"
    
} else {
    Print-Error "Invalid choice"
    exit 1
}

# Run database migrations
Write-Host ""
Print-Warning "Running database migrations..."
docker-compose exec backend npm run db:migrate
Print-Success "Database migrations complete"

# Show running containers
Write-Host ""
Write-Host "Running containers:"
docker-compose ps

Write-Host ""
Print-Success "Deployment completed successfully!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Check application logs: docker-compose logs -f"
Write-Host "2. Verify health check: curl http://localhost:5010/api/v1/health"
Write-Host "3. Access the application at your configured URL"
