#!/bin/bash

# Job Board Deployment Script
# This script helps with common deployment tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found"
        print_status "Copying .env.example to .env"
        cp .env.example .env
        print_warning "Please edit .env with your actual configuration before proceeding"
        exit 1
    fi
    print_status ".env file found"
}

# Check if caddy_network exists
check_network() {
    if ! docker network ls | grep -q caddy_network; then
        print_warning "caddy_network not found"
        print_status "Creating caddy_network..."
        docker network create caddy_network
        print_status "caddy_network created"
    else
        print_status "caddy_network exists"
    fi
}

# Deploy the application
deploy() {
    print_status "Starting deployment..."
    
    # Build and start services
    docker-compose up -d --build
    
    print_status "Waiting for services to be healthy..."
    
    # Wait for services to be healthy
    timeout=300  # 5 minutes
    elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if docker-compose ps | grep -q "healthy"; then
            print_status "Services are healthy!"
            break
        fi
        sleep 5
        elapsed=$((elapsed + 5))
        echo -n "."
    done
    
    if [ $elapsed -ge $timeout ]; then
        print_error "Services failed to become healthy within timeout"
        print_status "Checking logs..."
        docker-compose logs
        exit 1
    fi
    
    print_status "Deployment completed successfully!"
    print_status "Frontend: Available through your Caddy proxy"
    print_status "Backend API: Available at /api/ through the frontend"
}

# Show service status
status() {
    print_status "Service Status:"
    docker-compose ps
    
    print_status "\nService Logs (last 20 lines):"
    docker-compose logs --tail=20
}

# Update the application
update() {
    print_status "Updating application..."
    
    # Pull latest code (assumes git repo)
    if [ -d .git ]; then
        git pull
    fi
    
    # Rebuild and restart
    docker-compose down
    docker-compose up -d --build
    
    print_status "Application updated successfully!"
}

# Backup data
backup() {
    backup_dir="./backups"
    timestamp=$(date +%Y%m%d_%H%M%S)
    
    mkdir -p $backup_dir
    
    print_status "Creating backup..."
    
    # Backup database
    if docker-compose ps | grep -q backend; then
        docker-compose exec backend cp /app/db/database.db /tmp/backup.db 2>/dev/null || true
        docker cp $(docker-compose ps -q backend):/tmp/backup.db $backup_dir/database_$timestamp.db 2>/dev/null || print_warning "Database backup failed"
    fi
    
    # Backup uploads
    docker run --rm -v job-board-system_backend_uploads:/data -v $(pwd)/$backup_dir:/backup alpine tar czf /backup/uploads_$timestamp.tar.gz -C /data . 2>/dev/null || print_warning "Uploads backup failed"
    
    print_status "Backup created in $backup_dir/"
    ls -la $backup_dir/
}

# Show help
show_help() {
    echo "Job Board Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy    - Deploy the application (build and start services)"
    echo "  status    - Show service status and logs"
    echo "  update    - Update and restart the application"
    echo "  backup    - Backup database and uploads"
    echo "  logs      - Show service logs"
    echo "  restart   - Restart all services"
    echo "  stop      - Stop all services"
    echo "  help      - Show this help message"
    echo ""
}

# Main script logic
case "${1:-help}" in
    deploy)
        check_docker
        check_env
        check_network
        deploy
        ;;
    status)
        status
        ;;
    update)
        check_docker
        update
        ;;
    backup)
        backup
        ;;
    logs)
        docker-compose logs -f
        ;;
    restart)
        print_status "Restarting services..."
        docker-compose restart
        print_status "Services restarted"
        ;;
    stop)
        print_status "Stopping services..."
        docker-compose down
        print_status "Services stopped"
        ;;
    help|*)
        show_help
        ;;
esac
