# 📊 Firebase Application Monitoring Guide

## Quick Access to Monitoring Dashboards

### 🔗 Direct Links

**Firebase Console:** https://console.firebase.google.com/project/studio-7943908738-8bbf8/overview

**Key Monitoring Sections:**
- **Analytics:** https://console.firebase.google.com/project/studio-7943908738-8bbf8/analytics
- **Performance:** https://console.firebase.google.com/project/studio-7943908738-8bbf8/performance
- **Hosting:** https://console.firebase.google.com/project/studio-7943908738-8bbf8/hosting
- **Firestore:** https://console.firebase.google.com/project/studio-7943908738-8bbf8/firestore
- **Authentication:** https://console.firebase.google.com/project/studio-7943908738-8bbf8/authentication

---

## 🎯 What to Monitor

### 1. **Firebase Hosting Metrics**

Navigate to: **Hosting → Usage**

Monitor:
- ✅ **Requests:** Number of page loads
- ✅ **Bandwidth:** Data transferred
- ✅ **Storage:** Total file size
- ✅ **SSL Certificates:** Expiration status

**How to Check:**
```powershell
# View hosting details
firebase hosting:channel:list

# Check deployment history
firebase hosting:channel:open live
```

---

### 2. **Firebase Analytics**

Navigate to: **Analytics → Dashboard**

**Key Metrics:**
- 📈 **Active Users:** Real-time and historical
- 📊 **User Engagement:** Session duration, pages per session
- 🌍 **Geography:** User locations
- 📱 **Devices:** Desktop vs mobile usage
- 🔥 **Events:** Custom tracked events

**Events Being Tracked:**
- `property_registered` - When a new property is added
- `bill_generated` - When a bill is created
- `bill_downloaded` - When a bill PDF is downloaded
- `report_generated` - When a report is viewed
- `login` / `logout` - User authentication events
- `search` - Search queries performed
- `error` - Application errors

**View Events in Console:**
1. Go to Analytics → Events
2. Click on any event to see details
3. View event parameters and trends

---

### 3. **Firebase Performance Monitoring**

Navigate to: **Performance → Dashboard**

**Automatic Monitoring:**
- ⚡ **Page Load Times:** How fast pages load
- 🌐 **Network Requests:** API call latencies
- 📦 **Resource Loading:** JS, CSS, image load times
- 🔄 **App Startup Time:** Initial load performance

**Custom Traces:**
You can add custom performance traces for specific operations:

```typescript
import { getPerformanceInstance } from '@/lib/monitoring';

const perf = getPerformanceInstance();
if (perf) {
  const trace = perf.trace('generate_bill');
  trace.start();
  // ... your code
  trace.stop();
}
```

---

### 4. **Firestore Database Usage**

Navigate to: **Firestore Database → Usage**

Monitor:
- 📚 **Document Reads:** Daily read operations
- ✍️ **Document Writes:** Daily write operations
- 🗑️ **Document Deletes:** Daily delete operations
- 💾 **Storage:** Total database size

**Check Current Usage:**
```powershell
# View Firestore data in console
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/firestore/data"
```

**Free Tier Limits:**
- Reads: 50,000/day
- Writes: 20,000/day
- Deletes: 20,000/day
- Storage: 1 GB

---

### 5. **Authentication Monitoring**

Navigate to: **Authentication → Users**

Track:
- 👥 **Total Users:** Number of registered users
- 🔐 **Sign-in Methods:** Email/password, Google, etc.
- 📅 **Recent Activity:** Last sign-in times
- ⚠️ **Failed Attempts:** Authentication errors

**View User Activity:**
```powershell
# Open authentication console
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/authentication/users"
```

---

### 6. **Error Monitoring**

**In Firebase Console:**
Navigate to: **Performance → Custom Traces**

Errors are tracked as custom events with the `error` event type.

**Local Monitoring:**
Check browser console for:
- Firebase connection errors
- Firestore permission errors
- Authentication issues

**Enhanced Error Tracking (Optional):**
Consider adding Sentry for detailed error tracking:

```bash
npm install @sentry/nextjs
```

---

## 📱 Real-Time Monitoring Commands

### Check Hosting Status
```powershell
# View current deployment
firebase hosting:channel:list

# Check live site status
Invoke-WebRequest -Uri "https://studio-7943908738-8bbf8.web.app" -Method HEAD
```

### Monitor Firestore
```powershell
# Export Firestore data for backup
firebase firestore:export gs://studio-7943908738-8bbf8.appspot.com/backups/$(Get-Date -Format 'yyyy-MM-dd')
```

### View Analytics (via CLI)
```powershell
# Open analytics dashboard
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/analytics/app/web:78bbe0731e745654be1146/overview"
```

---

## 🔔 Setting Up Alerts

### 1. **Performance Alerts**

In Firebase Console:
1. Go to **Performance → Settings**
2. Click **Create Alert**
3. Choose metrics:
   - Page load time > 3 seconds
   - Failed requests > 10/hour
   - Response time > 1 second

### 2. **Usage Alerts**

For quota monitoring:
1. Go to **Firestore → Usage**
2. Set up billing alerts
3. Configure:
   - Daily read threshold
   - Daily write threshold
   - Storage limit

### 3. **Email Notifications**

Configure in: **Project Settings → Integrations**
- Enable email alerts for:
  - Quota exceeded
  - Security rule violations
  - Performance degradation

---

## 📈 Key Metrics Dashboard

### Daily Checklist

**Morning Check (9 AM):**
```
□ Active users count
□ Any errors in last 24h
□ Page load performance
□ Hosting bandwidth usage
```

**Weekly Review (Monday):**
```
□ User growth trend
□ Most visited pages
□ Peak usage times
□ Database quota usage
□ Performance trends
```

**Monthly Analysis:**
```
□ Total bandwidth consumed
□ User engagement metrics
□ Cost vs free tier limits
□ Feature usage patterns
```

---

## 🎨 Custom Monitoring Integration

### Track User Actions

The monitoring system is already integrated. It automatically tracks:

**Property Operations:**
```typescript
import { trackUserAction } from '@/lib/monitoring';

// When registering a property
trackUserAction.propertyRegistered(propertyId);

// When generating a bill
trackUserAction.billGenerated(propertyId, amount);

// When downloading a bill
trackUserAction.billDownloaded(propertyId, billId);
```

**Authentication:**
```typescript
// Already integrated in firebase/auth
trackUserAction.userLogin(userId);
trackUserAction.userLogout();
```

**Search:**
```typescript
// Track searches
trackUserAction.searchPerformed(searchTerm, resultsCount);
```

**Errors:**
```typescript
// Track errors
trackUserAction.errorOccurred(error.message, error.code);
```

---

## 🔍 Debugging Tools

### Browser DevTools

**Check Firebase Connection:**
```javascript
// In browser console
console.log('Firebase initialized:', !!firebase.apps.length);
console.log('Analytics:', !!firebase.analytics());
console.log('Performance:', !!firebase.performance());
```

### Network Monitoring

**Monitor Firestore Requests:**
1. Open DevTools → Network tab
2. Filter by "firestore.googleapis.com"
3. Check request/response times
4. Look for 403 (permission) or 429 (quota) errors

### Performance Profiling

**Measure Page Load:**
```javascript
// In browser console
performance.getEntriesByType('navigation')[0]
```

---

## 📊 Reporting

### Generate Usage Reports

**Firebase Console:**
1. **Analytics → Reports**
2. Create custom reports:
   - User retention
   - Feature usage
   - Geographic distribution
   - Device breakdown

**Export Data:**
```powershell
# Export analytics data (BigQuery integration required)
firebase projects:addfirebase studio-7943908738-8bbf8
```

### Automated Reports

Set up weekly email reports:
1. Go to **Analytics → Reports**
2. Click **Schedule**
3. Configure:
   - Report type
   - Frequency (daily/weekly)
   - Recipients

---

## 🚨 Common Issues & Solutions

### High Firestore Reads
**Symptom:** Approaching daily read limit
**Solution:**
- Enable Firestore caching
- Optimize queries
- Use pagination
- Cache data client-side

### Slow Page Load
**Symptom:** Performance score < 80
**Solution:**
- Check Performance → Web Vitals
- Optimize images
- Enable CDN caching
- Reduce JavaScript bundle size

### Authentication Errors
**Symptom:** Users can't log in
**Solution:**
- Check Authentication → Settings
- Verify authorized domains
- Check security rules
- Review error logs

---

## 💰 Cost Monitoring

### Free Tier Limits

**Firestore:**
- 50K reads/day
- 20K writes/day
- 1 GB storage

**Hosting:**
- 10 GB storage
- 360 MB/day transfer

**Authentication:**
- Unlimited free

### Monitor Costs

View current usage:
```powershell
# Open billing dashboard
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/usage"
```

Set up budget alerts:
1. Go to **Usage & Billing**
2. Click **Set Budget Alert**
3. Configure threshold (e.g., 80% of free tier)

---

## 🔧 Maintenance Commands

### Daily Monitoring Script

Create `monitor.ps1`:
```powershell
# Check site health
$response = Invoke-WebRequest -Uri "https://studio-7943908738-8bbf8.web.app" -UseBasicParsing
Write-Host "Site Status: $($response.StatusCode)"

# Open Firebase Console
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/analytics"

# Open Performance Dashboard  
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/performance"
```

Run daily:
```powershell
.\monitor.ps1
```

---

## 📞 Quick Access Commands

```powershell
# Open main console
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8"

# Open Analytics
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/analytics"

# Open Performance
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/performance"

# Open Firestore
Start-Process "https://console.firebase.google.com/project/studio-7943908738-8bbf8/firestore"

# Check live site
Start-Process "https://studio-7943908738-8bbf8.web.app"

# View deployment history
firebase hosting:channel:list
```

---

## 🎯 Monitoring Best Practices

1. **Daily:** Check Analytics for active users and errors
2. **Weekly:** Review Performance metrics and quota usage
3. **Monthly:** Analyze trends and optimize based on data
4. **Quarterly:** Review costs and upgrade plan if needed

**Set Calendar Reminders:**
- Daily: 9:00 AM - Check dashboard
- Monday: 10:00 AM - Weekly review
- 1st of month: Full analysis

---

## 📚 Resources

**Firebase Documentation:**
- Analytics: https://firebase.google.com/docs/analytics
- Performance: https://firebase.google.com/docs/perf-mon
- Hosting: https://firebase.google.com/docs/hosting

**Support:**
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase

---

**Your monitoring is now set up and ready! 📊**

Start monitoring at: https://console.firebase.google.com/project/studio-7943908738-8bbf8
