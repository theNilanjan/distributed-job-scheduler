#!/bin/bash

# JobScheduler Deployment Script
# This script helps deploy the application to production

set -e

echo "🚀 JobScheduler Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    echo "Please copy .env.production to .env and configure your environment variables."
    exit 1
fi

print_success ".env file found"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed!"
    exit 1
fi

print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed!"
    exit 1
fi

print_success "Docker Compose is installed"

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_ACCESS_SECRET" "JWT_REFRESH_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_error "Missing required environment variables: ${missing_vars[*]}"
    exit 1
fi

print_success "Environment variables validated"

# Ask for deployment type
echo ""
echo "Select deployment type:"
echo "1) Local development (with Docker MySQL)"
echo "2) Production (with external MySQL)"
echo ""
read -p "Enter choice (1 or 2): " deployment_type

if [ "$deployment_type" = "1" ]; then
    echo ""
    print_warning "Deploying for local development..."
    docker-compose down
    docker-compose build
    docker-compose up -d
    print_success "Local development deployment complete!"
    echo "Access the application at http://localhost:5173"
    
elif [ "$deployment_type" = "2" ]; then
    echo ""
    print_warning "Deploying for production..."
    
    # Backup existing database if using local MySQL
    if [ "$DB_HOST" = "mysql" ]; then
        print_warning "You're using local MySQL. Consider using a managed MySQL service for production."
        read -p "Continue anyway? (y/n): " continue_local
        if [ "$continue_local" != "y" ]; then
            echo "Deployment cancelled."
            exit 0
        fi
    fi
    
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production deployment complete!"
    
else
    print_error "Invalid choice"
    exit 1
fi

# Run database migrations
echo ""
print_warning "Running database migrations..."
docker-compose exec backend npm run db:migrate
print_success "Database migrations complete"

# Show running containers
echo ""
echo "Running containers:"
docker-compose ps

echo ""
print_success "Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Check application logs: docker-compose logs -f"
echo "2. Verify health check: curl http://localhost:5010/api/v1/health"
echo "3. Access the application at your configured URL"
