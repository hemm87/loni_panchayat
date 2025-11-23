# Docker Deployment Guide

## Prerequisites
1. **Docker Desktop** installed and running
2. **Docker Hub account** (create at https://hub.docker.com)
3. Git repository updated with latest code

## Quick Deploy to Docker Hub

### Method 1: Using PowerShell Script (Recommended)

```powershell
# 1. Start Docker Desktop first!

# 2. Run the deployment script
.\docker-push.ps1
```

### Method 2: Manual Commands

```powershell
# 1. Start Docker Desktop

# 2. Build the image
docker build -t loni-panchayat:latest -t hemm87/loni-panchayat:latest .

# 3. Login to Docker Hub
docker login

# 4. Push to Docker Hub
docker push hemm87/loni-panchayat:latest

# 5. Tag and push specific version
docker tag loni-panchayat:latest hemm87/loni-panchayat:v1.0.0
docker push hemm87/loni-panchayat:v1.0.0
```

## Running the Container

### Local Testing
```powershell
# Run with environment variables
docker run -p 3000:3000 --env-file .env.local loni-panchayat:latest

# Or run detached (background)
docker run -d -p 3000:3000 --env-file .env.local --name loni-panchayat loni-panchayat:latest
```

### Using Docker Compose
```powershell
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Pulling from Docker Hub

Anyone can now pull and run your application:

```bash
# Pull the latest version
docker pull hemm87/loni-panchayat:latest

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_FIREBASE_API_KEY="your-key" \
  -e NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain" \
  -e NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id" \
  hemm87/loni-panchayat:latest
```

## Environment Variables Required

Create a `.env.local` file with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

## Deployment Platforms

### Docker Hub
✅ **Already configured!**
- Repository: `hemm87/loni-panchayat`
- Public/Private: Set in Docker Hub settings

### AWS ECS (Elastic Container Service)
```bash
# Install AWS CLI and configure
aws configure

# Push to ECR (Elastic Container Registry)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag loni-panchayat:latest YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/loni-panchayat:latest
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/loni-panchayat:latest
```

### Google Cloud Run
```bash
# Tag for GCR
docker tag loni-panchayat:latest gcr.io/YOUR_PROJECT_ID/loni-panchayat:latest

# Push to GCR
docker push gcr.io/YOUR_PROJECT_ID/loni-panchayat:latest

# Deploy to Cloud Run
gcloud run deploy loni-panchayat \
  --image gcr.io/YOUR_PROJECT_ID/loni-panchayat:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Registry
```bash
# Login to ACR
az acr login --name YOUR_REGISTRY_NAME

# Tag and push
docker tag loni-panchayat:latest YOUR_REGISTRY_NAME.azurecr.io/loni-panchayat:latest
docker push YOUR_REGISTRY_NAME.azurecr.io/loni-panchayat:latest
```

## Troubleshooting

### Docker Desktop Not Running
```
Error: Cannot connect to the Docker daemon
Solution: Start Docker Desktop application
```

### Port Already in Use
```powershell
# Find and stop process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Or use a different port
docker run -p 3001:3000 loni-panchayat:latest
```

### Build Fails
```powershell
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t loni-panchayat:latest .
```

## Container Management

```powershell
# List running containers
docker ps

# Stop container
docker stop loni-panchayat

# Remove container
docker rm loni-panchayat

# View logs
docker logs loni-panchayat

# Follow logs
docker logs -f loni-panchayat

# Execute command in container
docker exec -it loni-panchayat sh
```

## Image Management

```powershell
# List images
docker images

# Remove image
docker rmi loni-panchayat:latest

# Remove unused images
docker image prune

# View image details
docker inspect loni-panchayat:latest
```

## Production Checklist

- [ ] Docker Desktop installed and running
- [ ] `.env.local` file configured with production values
- [ ] Application built and tested locally
- [ ] Docker image built successfully
- [ ] Pushed to Docker Hub (or other registry)
- [ ] Security: Environment variables secured
- [ ] Monitoring: Logs configured
- [ ] Backups: Data persistence strategy
- [ ] SSL/HTTPS: Reverse proxy configured (nginx/traefik)
- [ ] Scaling: Load balancer if needed

## Next Steps

1. **Start Docker Desktop** - Ensure it's fully running
2. **Run the script** - Execute `.\docker-push.ps1`
3. **Verify deployment** - Check Docker Hub for your images
4. **Deploy to production** - Use the image on any Docker-compatible platform

## Support

For issues or questions:
- Docker Documentation: https://docs.docker.com
- Next.js Docker: https://nextjs.org/docs/deployment#docker-image
- Firebase Hosting: https://firebase.google.com/docs/hosting
