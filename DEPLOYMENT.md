# Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Firebase account with project configured
- (Optional) Docker for containerized deployment

### Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure environment variables:**
   Edit `.env.local` and fill in your Firebase credentials and configuration.

   Required variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

3. **Install dependencies:**
   ```bash
   npm ci
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

## 🏗️ Building for Production

### Standard Build

```bash
# Clean previous builds
npm run clean

# Run validation (linting + type checking)
npm run validate

# Build for production
npm run build:prod

# Start production server
npm run start:prod
```

### Docker Build

```bash
# Build Docker image
npm run docker:build

# Run Docker container
npm run docker:run
```

Or manually:

```bash
docker build -t loni-panchayat:latest .
docker run -p 3000:3000 --env-file .env.local loni-panchayat:latest
```

## 🔐 Security Checklist

Before deploying to production, ensure:

### Environment Variables
- [ ] All sensitive data moved to environment variables
- [ ] No hardcoded API keys or secrets in code
- [ ] Production `.env` file is not committed to git
- [ ] Environment variables are set in hosting platform

### Firebase Security
- [ ] Firestore security rules are properly configured
- [ ] Admin emails are set via `NEXT_PUBLIC_ADMIN_EMAILS`
- [ ] Firebase Auth is properly configured
- [ ] Rate limiting is enabled (if applicable)

### Application Security
- [ ] HTTPS is enforced (`NEXT_PUBLIC_FORCE_HTTPS=true`)
- [ ] Security headers are configured in `next.config.ts`
- [ ] Input sanitization is enabled
- [ ] Error messages don't expose sensitive information
- [ ] Console logs are disabled in production

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] No console.log statements in production code
- [ ] All dependencies are up to date
- [ ] Security audit passed (`npm audit`)

## 🌐 Deployment Options

### Option 1: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not done):**
   ```bash
   firebase init hosting
   ```

4. **Deploy:**
   ```bash
   npm run build:prod
   firebase deploy --only hosting
   ```

### Option 2: Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Configure environment variables in Vercel dashboard**

### Option 3: Docker + Cloud Run / AWS ECS / Azure Container Apps

1. **Build Docker image:**
   ```bash
   docker build -t loni-panchayat:latest .
   ```

2. **Tag and push to container registry:**
   ```bash
   # Google Cloud
   docker tag loni-panchayat:latest gcr.io/YOUR_PROJECT/loni-panchayat:latest
   docker push gcr.io/YOUR_PROJECT/loni-panchayat:latest

   # AWS ECR
   docker tag loni-panchayat:latest YOUR_AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/loni-panchayat:latest
   docker push YOUR_AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/loni-panchayat:latest
   ```

3. **Deploy to container service**

### Option 4: Traditional VPS (DigitalOcean, Linode, etc.)

1. **SSH into server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone repository:**
   ```bash
   git clone https://github.com/hemm87/loni_panchayat.git
   cd loni_panchayat
   ```

3. **Setup environment:**
   ```bash
   cp .env.example .env.local
   nano .env.local  # Edit with your values
   ```

4. **Install dependencies and build:**
   ```bash
   npm ci
   npm run build:prod
   ```

5. **Setup PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "loni-panchayat" -- run start:prod
   pm2 save
   pm2 startup
   ```

6. **Setup Nginx reverse proxy:**
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

7. **Setup SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## 📊 Monitoring & Logging

### Application Logs

Logs are written to console in production. Configure log aggregation:

**PM2 Logs:**
```bash
pm2 logs loni-panchayat
```

**Docker Logs:**
```bash
docker logs -f container-id
```

### Health Checks

The application exposes a health check endpoint:
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1234.56,
  "environment": "production",
  "version": "1.0.0"
}
```

### Performance Monitoring

Consider integrating:
- **Sentry** - Error tracking and performance monitoring
- **Google Analytics** - User behavior analytics
- **LogRocket** - Session replay and debugging
- **Datadog** - Infrastructure and application monitoring

## 🔧 Troubleshooting

### Build Failures

**Issue:** TypeScript errors during build
```bash
# Check specific errors
npm run typecheck

# Fix automatically where possible
npm run lint:fix
```

**Issue:** Out of memory during build
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Runtime Issues

**Issue:** Firebase authentication not working
- Verify all Firebase environment variables are set
- Check Firebase console for project configuration
- Ensure domain is authorized in Firebase Auth settings

**Issue:** 500 Internal Server Error
- Check server logs for detailed error messages
- Verify all required environment variables are set
- Check Firebase Firestore security rules

**Issue:** Styles not loading
- Clear Next.js cache: `npm run clean`
- Rebuild: `npm run build:prod`

## 📈 Performance Optimization

### Image Optimization
- Images are automatically optimized by Next.js
- Use `next/image` component for all images
- Configure image domains in `next.config.ts`

### Bundle Size Analysis
```bash
npm run analyze
```

### Caching Strategy
- Static assets are cached automatically
- API responses should implement appropriate cache headers
- Consider implementing Service Worker for offline support

## 🔄 Updates & Maintenance

### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update major versions (carefully)
npx npm-check-updates -u
npm install
```

### Database Backups

**Firebase Firestore:**
```bash
gcloud firestore export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)
```

### Rolling Back

**Firebase Hosting:**
```bash
firebase hosting:channel:deploy rollback
```

**Docker:**
```bash
docker pull gcr.io/YOUR_PROJECT/loni-panchayat:previous-tag
docker stop current-container
docker run -d gcr.io/YOUR_PROJECT/loni-panchayat:previous-tag
```

## 📞 Support

For issues or questions:
- Check documentation in `/docs` folder
- Review GitHub issues
- Contact: admin@lonipanchayat.in

## 📝 License

[Add your license information here]
