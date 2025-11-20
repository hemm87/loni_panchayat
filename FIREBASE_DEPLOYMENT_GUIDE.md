# Firebase Deployment Guide

## 🚀 Complete Guide to Deploy Loni Panchayat to Firebase Hosting

### Prerequisites

✅ **Already Completed:**
- Firebase CLI installed (v14.25.0)
- Logged into Firebase with admin account
- Firebase project configured (`studio-7943908738-8bbf8`)
- Next.js application built and tested

---

## 📋 Deployment Options

### Option 1: Quick Deploy (Recommended)

Deploy your application to Firebase Hosting with a single command:

```powershell
npm run firebase:deploy
```

This command will:
1. Build Next.js in static export mode
2. Export to `out/` directory
3. Deploy to Firebase Hosting

### Option 2: Step-by-Step Deploy

```powershell
# Step 1: Build the application for static export
npm run build:export

# Step 2: Deploy to Firebase Hosting
firebase deploy --only hosting
```

### Option 3: Deploy Everything (Hosting + Firestore + Functions)

```powershell
npm run firebase:deploy:all
```

This deploys:
- Firebase Hosting (your Next.js app)
- Firestore Security Rules
- Firebase Functions
- Firebase Storage Rules

---

## 🎯 Deployment Steps

### 1. **Pre-Deployment Checklist**

Before deploying, ensure:

- [ ] All environment variables are set in Firebase Console
- [ ] Firestore security rules are configured
- [ ] Firebase Authentication is enabled
- [ ] Application builds successfully locally

### 2. **Set Environment Variables in Firebase**

Since Firebase Hosting serves static files, your environment variables need to be baked into the build. They're already in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDOC7T94WuuLw3j2isTaoDAvUmDMrCslyQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-7943908738-8bbf8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-7943908738-8bbf8
NEXT_PUBLIC_FIREBASE_APP_ID=1:392878434867:web:78bbe0731e745654be1146
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=392878434867
```

**For production, update:**

```env
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://studio-7943908738-8bbf8.web.app
```

### 3. **Deploy Firestore Security Rules**

```powershell
firebase deploy --only firestore:rules
```

Your `firestore.rules` file will be deployed to secure your database.

### 4. **Deploy the Application**

```powershell
# Deploy hosting only
npm run firebase:deploy

# Or deploy everything
npm run firebase:deploy:all
```

### 5. **Verify Deployment**

After deployment completes, you'll see:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/studio-7943908738-8bbf8/overview
Hosting URL: https://studio-7943908738-8bbf8.web.app
```

Visit the Hosting URL to see your live application!

---

## 🔧 Configuration Files

### `firebase.json`

```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### `next.config.ts`

Updated to support static export:

```typescript
output: process.env.NEXT_PUBLIC_BUILD_MODE === 'export' ? 'export' : undefined
```

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│         Firebase Hosting (CDN)                  │
│  https://studio-7943908738-8bbf8.web.app       │
│                                                  │
│  ┌──────────────────────────────────────┐      │
│  │  Static Next.js Export (out/)         │      │
│  │  • HTML, CSS, JS files                │      │
│  │  • Optimized images                    │      │
│  │  • Static assets                       │      │
│  └──────────────────────────────────────┘      │
└─────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────┐
│         Firebase Backend Services               │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Firestore   │  │  Auth        │            │
│  │  Database    │  │  Service     │            │
│  └──────────────┘  └──────────────┘            │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  Storage     │  │  Functions   │            │
│  │  Bucket      │  │  (Optional)  │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Security Configuration

### Firestore Security Rules

Deploy your security rules:

```powershell
firebase deploy --only firestore:rules
```

Example rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties collection
    match /properties/{propertyId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Settings (admin only)
    match /panchayat-settings/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Firebase Authentication

Enable authentication methods in Firebase Console:
1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Add authorized domains if using custom domain

---

## 🌐 Custom Domain Setup (Optional)

### Step 1: Add Custom Domain

```powershell
firebase hosting:channel:deploy production
```

### Step 2: Configure DNS

In Firebase Console:
1. Go to Hosting → Add Custom Domain
2. Enter your domain (e.g., `lonipanchayat.in`)
3. Add DNS records provided by Firebase:
   - Type: A
   - Name: @
   - Value: (IP provided by Firebase)

### Step 3: SSL Certificate

Firebase automatically provisions SSL certificates for custom domains (free via Let's Encrypt).

---

## 🔄 Continuous Deployment with GitHub Actions

Create `.github/workflows/firebase-hosting.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:export
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: studio-7943908738-8bbf8
```

---

## 📈 Monitoring & Analytics

### Firebase Performance Monitoring

Add to your app:

```typescript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

### Firebase Analytics

```typescript
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

### View Metrics

1. Firebase Console → Performance
2. Firebase Console → Analytics

---

## 🚨 Troubleshooting

### Issue: Build Fails

```powershell
# Clear cache and rebuild
npm run clean
npm run build:export
```

### Issue: Environment Variables Not Working

Ensure all variables start with `NEXT_PUBLIC_` for client-side access.

### Issue: 404 on Refresh

This is handled by the rewrite rule in `firebase.json`:

```json
"rewrites": [
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```

### Issue: Slow Performance

1. Enable caching headers (already configured)
2. Use Next.js Image optimization
3. Enable Firebase Performance Monitoring

---

## 📝 Deployment Commands Reference

```powershell
# Quick deploy (recommended)
npm run firebase:deploy

# Deploy with fresh build
npm run clean
npm run build:export
firebase deploy --only hosting

# Deploy everything (hosting + firestore + functions)
npm run firebase:deploy:all

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only storage

# View deployment history
firebase hosting:channel:list

# Rollback deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

---

## 💰 Cost Estimation

Firebase Hosting (Free Tier):
- ✅ 10 GB storage
- ✅ 360 MB/day transfer
- ✅ SSL certificate (free)
- ✅ CDN included

Firestore (Free Tier):
- ✅ 1 GB storage
- ✅ 50K reads/day
- ✅ 20K writes/day

Your application should stay within free tier limits for initial usage.

---

## 🎉 Post-Deployment Checklist

After successful deployment:

- [ ] Visit your hosting URL and verify the app loads
- [ ] Test user authentication
- [ ] Verify Firestore operations (read/write)
- [ ] Test property registration
- [ ] Generate and download a test bill
- [ ] Check Firebase Console for any errors
- [ ] Set up monitoring and analytics
- [ ] Update documentation with production URL
- [ ] Share the URL with stakeholders

---

## 📞 Support

**Firebase Console:**
https://console.firebase.google.com/project/studio-7943908738-8bbf8

**Firebase Documentation:**
https://firebase.google.com/docs/hosting

**Next.js Static Export:**
https://nextjs.org/docs/app/building-your-application/deploying/static-exports

---

## 🔄 Regular Maintenance

```powershell
# Weekly: Check for updates
npm outdated

# Monthly: Update dependencies
npm update

# As needed: Redeploy
npm run firebase:deploy
```

---

**Your application is now ready to deploy to Firebase Hosting! 🚀**

Run `npm run firebase:deploy` to start the deployment process.
