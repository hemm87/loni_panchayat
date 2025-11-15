'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Shield, User as UserIcon } from 'lucide-react';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'operator' | 'viewer' | 'citizen';
}

/**
 * Component to display current user's role and permissions status
 * Useful for debugging permission issues
 */
export function UserRoleDisplay() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user || !firestore) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: userDoc.data()?.role as any,
          });
        } else {
          setError('User document not found in Firestore');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user, firestore]);

  if (isUserLoading || loading) {
    return (
      <Alert className="border-primary/30 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>Loading user permissions...</AlertTitle>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Authenticated</AlertTitle>
        <AlertDescription>
          Please sign in to view your permissions.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading User Role</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const hasPermission = userData?.role === 'admin' || userData?.role === 'operator';
  const roleColor = {
    admin: 'badge-success',
    operator: 'badge-info',
    viewer: 'badge-warning',
    citizen: 'badge-warning',
  }[userData?.role || 'viewer'];

  return (
    <Alert className={hasPermission ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
      <div className="flex items-start gap-3">
        {hasPermission ? (
          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
        )}
        <div className="flex-1 space-y-2">
          <AlertTitle className="text-base font-bold flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            User Permissions Status
          </AlertTitle>
          <AlertDescription className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span className="font-semibold">{userData?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>{' '}
                <Badge className={roleColor}>
                  {userData?.role?.toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border/50">
              {hasPermission ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-semibold">You have permission to generate bills</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-semibold">Limited permissions - Cannot generate bills</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 pl-6">
                    <p className="font-semibold mb-1">To fix this:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Contact an admin to upgrade your role to "operator" or "admin"</li>
                      <li>Or add your email to ADMIN_EMAILS in src/lib/utils.ts</li>
                      <li>See PERMISSIONS_FIX_GUIDE.md for detailed instructions</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
