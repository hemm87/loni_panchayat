# Deployment Guide

## ✅ Deployment Setup Complete

Your Loni Panchayat application is now ready for deployment with multiple options:

### 🎯 What's Been Set Up

1. **Docker Image Built** ✅
   - Image: `loni-panchayat:latest`
   - Size: 413MB
   - Status: Production-ready

2. **GitHub Actions CI/CD** ✅
   - Workflow: `.github/workflows/docker-publish.yml`
   - Triggers: On push to `main` branch
   - Publishes to: GitHub Container Registry (GHCR)
   - Image URL: `ghcr.io/hemm87/loni_panchayat:latest`

3. **Docker Compose Deploy** ✅
   - File: `docker-compose.deploy.yml`
   - Port: 3000
   - Environment: Uses `.env.local`
   - Status: Running and verified

4. **Health Check Verified** ✅
   - Endpoint: `http://localhost:3000/api/health`
   - Response: `{"status":"healthy","timestamp":"...","uptime":...}`
   - Container: Running smoothly

---

## 🚀 Deployment Options

### Option 1: Local Deployment (Docker Compose) ✅ ACTIVE

**Currently running!** Access your app at http://localhost:3000

```powershell
# Start the application
docker-compose -f docker-compose.deploy.yml up -d

# View logs
docker-compose -f docker-compose.deploy.yml logs -f

# Stop the application
docker-compose -f docker-compose.deploy.yml down

# Restart after code changes (rebuild image first)
docker build -t loni-panchayat:latest .
docker-compose -f docker-compose.deploy.yml up -d --force-recreate
```

---

### Option 2: GitHub Container Registry → Cloud Platform

#### Step 1: Push to GHCR (Automated via GitHub Actions)

Every push to `main` branch automatically:
1. Builds the Docker image
2. Pushes to `ghcr.io/hemm87/loni_panchayat:latest`
3. Tags with commit SHA for version tracking

**Manual push (if needed):**
```powershell
# Login to GHCR
docker login ghcr.io -u hemm87

# Tag the image
docker tag loni-panchayat:latest ghcr.io/hemm87/loni_panchayat:latest

# Push to GHCR
docker push ghcr.io/hemm87/loni_panchayat:latest
```

#### Step 2: Deploy to Cloud Platform

**Google Cloud Run:**
```bash
gcloud run deploy loni-panchayat \
  --image ghcr.io/hemm87/loni_panchayat:latest \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_FIREBASE_API_KEY=your-key,NODE_ENV=production
```

**AWS ECS/Fargate:**
1. Create task definition using `ghcr.io/hemm87/loni_panchayat:latest`
2. Configure container port 3000
3. Set environment variables from `.env.local`
4. Create service with desired task count

**Azure Container Instances:**
```bash
az container create \
  --resource-group myResourceGroup \
  --name loni-panchayat \
  --image ghcr.io/hemm87/loni_panchayat:latest \
  --dns-name-label loni-panchayat \
  --ports 3000 \
  --environment-variables NEXT_PUBLIC_FIREBASE_API_KEY=your-key NODE_ENV=production
```

**Railway:**
1. Create new project from Docker image
2. Set image: `ghcr.io/hemm87/loni_panchayat:latest`
3. Configure environment variables
4. Railway will auto-deploy

**Render:**
1. New Web Service → Docker
2. Image URL: `ghcr.io/hemm87/loni_panchayat:latest`
3. Port: 3000
4. Add environment variables
5. Deploy

---

### Option 3: Server/VPS Deployment

**Using Docker Compose on your server:**

```bash
# SSH into your server
ssh user@your-server.com

# Clone the repository
git clone https://github.com/hemm87/loni_panchayat.git
cd loni_panchayat

# Create .env.local with your Firebase config
nano .env.local

# Pull the latest image from GHCR
docker login ghcr.io -u hemm87
docker pull ghcr.io/hemm87/loni_panchayat:latest

# Update docker-compose.deploy.yml to use GHCR image
sed -i 's|image: loni-panchayat:latest|image: ghcr.io/hemm87/loni_panchayat:latest|' docker-compose.deploy.yml

# Start the application
docker-compose -f docker-compose.deploy.yml up -d

# Set up reverse proxy (nginx)
sudo nano /etc/nginx/sites-available/loni-panchayat
```

**Sample nginx config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Required Environment Variables

Create `.env.local` with these variables:

```env
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Node Environment
NODE_ENV=production

# Optional: Firebase Admin SDK (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 🔄 CI/CD Workflow

### Automated Deployment Process

1. **Developer pushes to `main` branch**
2. **GitHub Actions triggers** (`.github/workflows/docker-publish.yml`)
3. **Image builds** (~3-4 minutes)
4. **Image pushes to GHCR** (`ghcr.io/hemm87/loni_panchayat:latest`)
5. **Cloud platform auto-deploys** (if webhook configured)

### Manual Deployment Trigger

```bash
# Force rebuild and deploy
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

---

## 📊 Monitoring & Health Checks

### Health Endpoint

```bash
# Check application health
curl http://your-domain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-11-16T06:23:10.173Z",
  "uptime": 1234.567,
  "environment": "production",
  "version": "1.0.0"
}
```

### Container Monitoring

```powershell
# View container stats
docker stats loni_panchayat-app-1

# View logs
docker logs -f loni_panchayat-app-1

# Check container status
docker ps --filter name=loni_panchayat-app-1
```

---

## 🛠️ Maintenance Commands

### Update Application

```powershell
# Local: Rebuild and restart
docker build -t loni-panchayat:latest .
docker-compose -f docker-compose.deploy.yml up -d --force-recreate

# Server: Pull latest and restart
docker pull ghcr.io/hemm87/loni_panchayat:latest
docker-compose -f docker-compose.deploy.yml up -d --force-recreate
```

### View Logs

```powershell
# All logs
docker-compose -f docker-compose.deploy.yml logs

# Follow logs
docker-compose -f docker-compose.deploy.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.deploy.yml logs --tail 100
```

### Backup & Restore

```bash
# Backup Firestore (from Firebase Console or CLI)
firebase firestore:backup gs://your-bucket/backups/$(date +%Y%m%d)

# Export Docker image
docker save loni-panchayat:latest | gzip > loni-panchayat-backup.tar.gz

# Import Docker image
docker load < loni-panchayat-backup.tar.gz
```

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` to Git
   - Use secrets management in production (AWS Secrets Manager, GCP Secret Manager, etc.)
   - Rotate Firebase keys periodically

2. **Firewall Rules**
   - Only expose port 3000 behind reverse proxy
   - Use HTTPS/SSL in production
   - Configure Firebase Security Rules

3. **Updates**
   - Keep Docker base image updated
   - Regular dependency updates (`npm audit fix`)
   - Monitor GitHub Dependabot alerts

4. **Access Control**
   - Implement Firebase Authentication
   - Use Firebase Security Rules
   - Set up role-based access control (RBAC)

---

## 🎯 Quick Start Checklist

- [x] Docker image built locally
- [x] GitHub Actions workflow created
- [x] Docker Compose file ready
- [x] Application running locally on port 3000
- [x] Health endpoint verified
- [ ] Configure Firebase Security Rules
- [ ] Set up SSL certificate (for production domain)
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Configure automated backups
- [ ] Set up domain and DNS

---

## 📚 Related Documentation

- [DOCKER_BUILD_GUIDE.md](./DOCKER_BUILD_GUIDE.md) - Comprehensive Docker commands
- [COMPLETE_TRANSFORMATION_SUMMARY.md](./COMPLETE_TRANSFORMATION_SUMMARY.md) - Project overview
- [COMPONENT_REFACTORING_SUMMARY.md](./COMPONENT_REFACTORING_SUMMARY.md) - Code architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment instructions

---

## 🎉 Current Status

✅ **Application is LIVE and running!**

- **Local Access:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard  
- **Health Check:** http://localhost:3000/api/health
- **Container:** `loni_panchayat-app-1` (Up and healthy)
- **CI/CD:** Automated via GitHub Actions
- **Ready for:** Cloud deployment

**Next Steps:** Choose your deployment platform and follow the instructions above!

---

**Need help?** Check the troubleshooting sections in [DOCKER_BUILD_GUIDE.md](./DOCKER_BUILD_GUIDE.md) or [DEPLOYMENT.md](./DEPLOYMENT.md).
