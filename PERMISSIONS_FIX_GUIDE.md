# Missing Permissions Fix Guide

## Problem
Users cannot generate bills due to "Missing or insufficient permissions" error.

## Root Cause
The bill generation feature tries to update property documents in Firestore, but the Firestore Security Rules only allow `admin` or `operator` roles to update properties.

```javascript
// Current Firestore Rule:
match /properties/{propertyId} {
  allow update: if isAdminOrOperator(); // ❌ Blocks non-admin/operator users
}
```

## Current Role System
- **Admin emails**: Only `admin@lonipanchayat.in` gets `admin` role automatically
- **All other users**: Get `viewer` role by default (cannot update properties)
- **Roles**: `admin`, `operator`, `viewer`, `citizen`

## Solutions

### Solution 0: Use Emergency Admin Role Fixer (EASIEST) 🚀 NEW!

**This is the fastest way if you're already logged in but don't have permissions:**

1. **Go to your dashboard** (you should already be there)
2. **Look for the "Emergency Admin Role Fixer"** card below the User Permissions Status
3. **Click "Set My Role to Admin"** button
4. **Wait for success message**
5. **Refresh the page** (F5 or Ctrl+R)
6. **Done!** ✅ You now have admin permissions

**Note**: This tool directly updates your Firestore user document with admin role.

---

### Solution 1: Add Your Email as Admin (Quick Fix) ⭐ RECOMMENDED

1. **Edit** `src/lib/utils.ts`
2. **Add your email** to the `ADMIN_EMAILS` array:

```typescript
export const ADMIN_EMAILS = [
  'admin@lonipanchayat.in',
  'your-email@gmail.com',  // ⬅️ Add your email here
];
```

3. **Sign out and sign in again** to get admin role assigned
4. Your user document will be updated with `role: 'admin'`

### Solution 2: Manually Update User Role in Firebase Console

1. **Go to Firebase Console** → Firestore Database
2. **Navigate to** `users/{your-user-id}` collection
3. **Edit the document** and change:
   ```json
   {
     "role": "viewer"  // Change this to "admin" or "operator"
   }
   ```
4. **Save** the changes
5. **Refresh** your app (no need to re-login)

### Solution 3: Create Role Management UI (Long-term)

Create an admin panel to manage user roles:

```typescript
// Example: Admin can promote users to operator
async function updateUserRole(userId: string, newRole: 'admin' | 'operator' | 'viewer') {
  const { firestore } = initializeFirebase();
  await setDoc(doc(firestore, 'users', userId), { role: newRole }, { merge: true });
}
```

### Solution 4: Relax Firestore Rules (Security Risk)

⚠️ **NOT RECOMMENDED for production**

Change `firestore.rules` to allow all authenticated users:

```javascript
match /properties/{propertyId} {
  allow update: if isSignedIn(); // ⚠️ Less secure
}
```

## Verification Steps

After applying a fix:

1. **Check your user role**:
   - Firebase Console → Firestore → `users/{your-uid}` → Check `role` field
   - Should be `admin` or `operator`

2. **Test bill generation**:
   - Go to Dashboard → Generate Bill
   - Select a property and generate a bill
   - Should work without permission errors

## Common Issues

### Issue: "Still getting permission denied after adding email"
**Solution**: Sign out completely and sign in again. The role is assigned during login.

### Issue: "Cannot find my user document in Firestore"
**Solution**: Sign in at least once. The user document is created automatically on first login.

### Issue: "I want multiple admins"
**Solution**: Add all admin emails to `ADMIN_EMAILS` array in `src/lib/utils.ts`

## Next Steps

1. Apply **Solution 1** (add your email as admin)
2. Sign out and sign in again
3. Try generating a bill
4. If it works, you're done! ✅

## Additional Notes

- **Default admin**: `admin@lonipanchayat.in` / `password123`
- **User roles are checked** via Firestore rules using `getUserRole()` function
- **Roles are hierarchical**: `admin` > `operator` > `viewer` > `citizen`
