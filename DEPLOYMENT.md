# Docker Deployment Guide

This guide explains how to deploy the Job Board application using Docker and Docker Compose with an existing Caddy reverse proxy.

## Prerequisites

1. Docker and Docker Compose installed on your VPS
2. Existing Caddy reverse proxy running with a network named `caddy_network`
3. Domain configured to point to your VPS (e.g., `jobboard.haguma.com`)

## Deployment Steps

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url> job-board-system
cd job-board-system

# Copy environment file and configure
cp .env.example .env
nano .env  # Edit with your actual values
```

### 2. Create Caddy Network (if not exists)

```bash
# Check if caddy_network exists
docker network ls | grep caddy_network

# If it doesn't exist, create it
docker network create caddy_network
```

### 3. Build and Start Services

```bash
# Build and start the services
docker-compose up -d

# Check the status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Configure Caddy

Add this to your Caddyfile:

```
jobboard.haguma.com {
    reverse_proxy jobboard-frontend:80
}
```

Then reload Caddy:
```bash
docker exec caddy-container caddy reload --config /etc/caddy/Caddyfile
```

## Architecture

```
Internet → Caddy (caddy_network) → Frontend (nginx) → Backend (Node.js)
                                        ↓
                                   SQLite Database
                                   Uploaded Files
```

### Networks

- **caddy_network**: External network for Caddy to reach the frontend
- **internal_network**: Internal network for frontend-backend communication

### Volumes

- **backend_uploads**: Persistent storage for uploaded CV files
- **backend_db**: Persistent storage for SQLite database

## Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Backup Data
```bash
# Backup database
docker-compose exec backend cp /app/db/database.db /tmp/
docker cp $(docker-compose ps -q backend):/tmp/database.db ./backup-$(date +%Y%m%d).db

# Backup uploads
docker run --rm -v backend_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Data
```bash
# Restore database
docker cp ./backup-YYYYMMDD.db $(docker-compose ps -q backend):/app/db/database.db
docker-compose restart backend

# Restore uploads
docker run --rm -v backend_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup-YYYYMMDD.tar.gz -C /data
```

## Monitoring

### Health Checks
- Frontend: `http://jobboard.haguma.com/health`
- Backend: `http://jobboard.haguma.com/api/health`

### Container Status
```bash
# Check container health
docker-compose ps

# Check resource usage
docker stats $(docker-compose ps -q)
```

## Troubleshooting

### Common Issues

1. **Caddy can't reach frontend**
   - Ensure both Caddy and frontend are on `caddy_network`
   - Check network connectivity: `docker network inspect caddy_network`

2. **Frontend can't reach backend**
   - Ensure both services are on `internal_network`
   - Check container names match docker-compose.yml

3. **Database/uploads lost after restart**
   - Verify volume mounts in docker-compose.yml
   - Check volume status: `docker volume ls`

### Debug Commands
```bash
# Access containers
docker-compose exec backend sh
docker-compose exec frontend sh

# Check networks
docker network ls
docker network inspect caddy_network
docker network inspect job-board-system_internal_network

# Check volumes
docker volume ls
docker volume inspect job-board-system_backend_db
```

## Security Considerations

1. **Environment Variables**: Use strong, unique secrets
2. **Network Isolation**: Backend is not exposed to the internet
3. **File Permissions**: Containers run as non-root users
4. **Nginx Security**: Security headers and rate limiting configured
5. **Regular Updates**: Keep Docker images and dependencies updated

## Performance Optimization

1. **Nginx Caching**: Static assets cached for 1 year
2. **Gzip Compression**: Enabled for text files
3. **Health Checks**: Configured for proper load balancing
4. **Resource Limits**: Consider adding memory/CPU limits for production
