# Security Guide

## 🔐 Security Best Practices

This document outlines the security measures implemented in the Loni Panchayat application and best practices for maintaining security.

## Authentication & Authorization

### Firebase Authentication
- All user authentication is handled by Firebase Auth
- Supports Google OAuth 2.0 login
- Session management handled by Firebase SDK

### Role-Based Access Control (RBAC)
Four user roles are defined:
- **Admin**: Full system access
- **Operator**: Can manage properties and bills
- **Viewer**: Read-only access
- **Citizen**: Limited access to own records

### Role Assignment
Admin emails are configured via environment variable:
```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Firestore Security Rules

### Current Rules
Located in `firestore.rules`, enforcing:
- Authentication required for all operations
- Role-based write permissions
- Users can only read/write their own profile
- Admins have elevated permissions

### Recommended Improvements
```javascript
// Add rate limiting
match /properties/{document} {
  allow read: if isSignedIn() && 
              request.time < request.resource.data.rateLimit;
  allow write: if isAdminOrOperator() && 
               request.auth.token.email_verified == true;
}
```

## Input Sanitization

### Implemented Utilities
All user inputs should be sanitized using functions from `src/lib/security.ts`:

```typescript
import { 
  sanitizeString,
  sanitizeEmail,
  sanitizePhoneNumber,
  sanitizeNumber,
  sanitizeAddress 
} from '@/lib/security';

// Example usage
const cleanName = sanitizeString(userInput);
const cleanEmail = sanitizeEmail(emailInput);
```

### Protection Against

#### XSS (Cross-Site Scripting)
- HTML tags are stripped from all user inputs
- Script tags are explicitly removed
- React automatically escapes output

#### SQL/NoSQL Injection
- Firebase SDK uses parameterized queries
- No raw query construction
- Input validation before database operations

#### Path Traversal
- All file paths are validated
- No user-controlled file system access
- Firebase Storage rules enforce access control

## Environment Variables

### Sensitive Data
Never commit these to version control:
- API keys
- Database credentials
- OAuth secrets
- Admin email lists

### Production Configuration
```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_production_project

# Security
NEXT_PUBLIC_FORCE_HTTPS=true
ENABLE_CONSOLE_LOGS=false
```

## Security Headers

Configured in `next.config.ts`:

```typescript
headers: [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'  // Prevent clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'  // Prevent MIME sniffing
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
]
```

## Rate Limiting

### Implementation
Basic rate limiting implemented in `src/lib/security.ts`:

```typescript
import { checkRateLimit } from '@/lib/security';

// In API route or server action
const { allowed, remaining } = checkRateLimit(
  userIdentifier,
  100,  // max requests
  900000  // 15 minutes
);

if (!allowed) {
  return { error: 'Rate limit exceeded' };
}
```

### Production Recommendations
For production, implement distributed rate limiting:
- Use Redis for shared rate limit state
- Implement at API Gateway level
- Consider services like Cloudflare Rate Limiting

## Data Protection

### Data at Rest
- Firestore encrypts data at rest by default
- Sensitive data should be encrypted before storage
- Consider implementing field-level encryption for PII

### Data in Transit
- All Firebase connections use TLS 1.2+
- HTTPS enforced via security headers
- Certificate pinning for mobile apps (if applicable)

### Personal Data
Under GDPR/local regulations:
- Implement data retention policies
- Provide data export functionality
- Allow account deletion with data purge

## Error Handling

### Production Error Messages
Never expose:
- Stack traces
- Internal system paths
- Database structure
- API keys or secrets

### Implemented
```typescript
// Good - using centralized logger
import { logger } from '@/lib/logger';
logger.error('Operation failed', error, { userId });

// Bad - exposing details
console.error('Database error:', error.message);
```

## Dependency Security

### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual review required
npm audit fix --force
```

### Keep Updated
```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update
```

## Secrets Management

### Development
- Use `.env.local` (git-ignored)
- Never commit `.env` files

### Production
Use secure secret management:
- **Vercel**: Environment Variables in dashboard
- **AWS**: Secrets Manager or Parameter Store
- **GCP**: Secret Manager
- **Azure**: Key Vault

## Monitoring & Alerting

### Security Events to Monitor
1. Failed login attempts
2. Unauthorized access attempts
3. Unusual data access patterns
4. API rate limit violations
5. Configuration changes

### Recommended Tools
- **Sentry**: Error tracking and alerting
- **DataDog**: Security monitoring
- **AWS GuardDuty**: Threat detection
- **Firebase Security Rules Analytics**

## Incident Response

### If Security Breach Detected

1. **Immediate Actions**
   - Rotate all API keys and secrets
   - Review access logs
   - Disable compromised accounts
   - Alert team members

2. **Investigation**
   - Identify breach scope
   - Document timeline
   - Preserve evidence logs

3. **Remediation**
   - Patch vulnerabilities
   - Update security rules
   - Implement additional controls

4. **Communication**
   - Notify affected users
   - Report to authorities if required
   - Update security documentation

## Compliance

### Data Privacy
- **GDPR** (if serving EU users)
- **CCPA** (if serving California users)
- **Indian IT Act** (local compliance)

### Requirements
- [ ] Privacy policy published
- [ ] Terms of service defined
- [ ] Cookie consent implemented (if applicable)
- [ ] Data processing agreements
- [ ] User data export functionality
- [ ] Right to deletion implemented

## Security Checklist

### Before Production Deployment

#### Code Security
- [ ] All inputs sanitized
- [ ] SQL/NoSQL injection protected
- [ ] XSS protection implemented
- [ ] CSRF tokens where needed
- [ ] No sensitive data in logs
- [ ] Error messages sanitized

#### Authentication
- [ ] Strong password policy
- [ ] MFA available (if applicable)
- [ ] Session timeout configured
- [ ] Account lockout after failed attempts

#### Authorization
- [ ] RBAC properly implemented
- [ ] Firestore rules tested
- [ ] Least privilege principle applied
- [ ] Admin access audited

#### Infrastructure
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] DDoS protection in place
- [ ] Backup strategy defined

#### Monitoring
- [ ] Error tracking configured
- [ ] Security alerts set up
- [ ] Access logs monitored
- [ ] Incident response plan documented

## Regular Security Tasks

### Daily
- Monitor error logs
- Review failed auth attempts

### Weekly
- Check security alerts
- Review access patterns

### Monthly
- Run security audit
- Update dependencies
- Review user permissions
- Test backup restoration

### Quarterly
- Security training for team
- Penetration testing
- Policy review and updates
- Compliance audit

## Resources

### External Tools
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Checklist](https://firebase.google.com/docs/rules/secure-data)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)

### Internal Documentation
- `firestore.rules` - Database security rules
- `src/lib/security.ts` - Input sanitization utilities
- `src/lib/logger.ts` - Logging system
- `.env.example` - Environment configuration template

## Contact

For security concerns or to report vulnerabilities:
- Email: security@lonipanchayat.in
- Private disclosure preferred
- Response within 48 hours

---

**Last Updated**: November 2025  
**Next Review**: February 2026
