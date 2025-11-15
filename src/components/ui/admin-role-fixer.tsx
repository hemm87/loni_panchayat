'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Shield, RefreshCw } from 'lucide-react';

/**
 * Emergency Admin Role Fixer Component
 * Use this to manually set yourself as admin if you're locked out
 * This component should only be used during development/setup
 */
export function AdminRoleFixer() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const fixAdminRole = async () => {
    if (!user || !firestore) {
      setResult({ success: false, message: 'Not authenticated or Firestore not available' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const userRef = doc(firestore, 'users', user.uid);
      
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing document with admin role
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin User',
          photoURL: user.photoURL,
          role: 'admin', // Force admin role
          lastLogin: new Date().toISOString(),
        }, { merge: true });

        setResult({
          success: true,
          message: `✅ Successfully set role to 'admin' for ${user.email}. Please refresh the page.`
        });
      } else {
        // Create new user document with admin role
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin User',
          photoURL: user.photoURL,
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });

        setResult({
          success: true,
          message: `✅ Created user document with 'admin' role for ${user.email}. Please refresh the page.`
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not Authenticated</AlertTitle>
        <AlertDescription>
          You must be signed in to use the Admin Role Fixer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-warning/30 bg-warning/5">
        <Shield className="h-5 w-5 text-warning" />
        <AlertTitle className="text-lg font-bold">Emergency Admin Role Fixer</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">
            Use this tool if you're locked out and need admin permissions immediately.
            This will set your current account to <Badge className="badge-success">admin</Badge> role.
          </p>
          
          <div className="bg-muted/50 p-3 rounded-lg text-sm space-y-1">
            <p><strong>Current User:</strong> {user.email || 'No email'}</p>
            <p><strong>UID:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">{user.uid}</code></p>
          </div>

          <Button
            onClick={fixAdminRole}
            disabled={loading}
            className="w-full h-12 font-bold"
            variant="default"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Setting Admin Role...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 mr-2" />
                Set My Role to Admin
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mt-3">
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
            <p className="font-semibold mb-1">⚠️ Security Note:</p>
            <p>This component should be removed or protected in production. It allows any authenticated user to grant themselves admin privileges.</p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
