
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type UserCredential,
} from 'firebase/auth';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getFirebase } from '@/firebase/provider';


async function updateUserOnLogin(result: UserCredential) {
  const { firestore } = getFirebase();
  if (!firestore) throw new Error("Firestore not initialized");

  const user = result.user;
  const userRef = doc(firestore, 'users', user.uid);
  
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // User exists, update last login
      await updateDoc(userRef, {
        lastLogin: new Date().toISOString(),
      });
    } else {
      // User does not exist, create a new profile.
      // This is expected for first-time sign-ins, especially with Google.
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'Viewer', // Assign a default, least-privileged role
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error("Error updating user on login: ", error);
    // We can decide if we want to throw the error or handle it silently.
    // For now, logging should be sufficient.
  }
}

export default function LoginPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          toast({
            title: 'Sign In Successful',
            description: `Welcome back, ${user.displayName || user.email}!`,
          });
          updateUserOnLogin(result);
        }
      })
      .catch(error => {
        console.error("Google Sign-In Error", error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message,
        });
      })
      .finally(() => {
        setIsRedirecting(false);
      });
  }, [toast]);

  useEffect(() => {
    if (!userLoading && user) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleEmailLogin = async () => {
    setLoading(true);
    const auth = getAuth();
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await updateUserOnLogin(credential);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setIsRedirecting(true);
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const generateRecaptcha = () => {
    const auth = getAuth();
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response: any) => {},
        }
      );
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    generateRecaptcha();
    const auth = getAuth();
    const appVerifier = (window as any).recaptchaVerifier;
    try {
      const formattedPhoneNumber = `+${phoneNumber.replace(/\D/g, '')}`;
      if (formattedPhoneNumber.length < 10) { 
        throw new Error("Invalid phone number provided.");
      }
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to ${formattedPhoneNumber}.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to Send OTP',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      const credential = await confirmationResult.confirm(otp);
      await updateUserOnLogin(credential);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'OTP Verification Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || user || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-center pb-4">
            <Scale className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-center font-headline text-2xl">
            Loni Tax Manager
          </CardTitle>
          <CardDescription className="text-center">
            Select a method to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <div className="grid gap-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={handleEmailLogin}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login with Google
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="phone">
              {!otpSent ? (
                <div className="grid gap-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      required
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Verify OTP
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setOtpSent(false);
                      setPhoneNumber('');
                      setOtp('');
                    }}
                    disabled={loading}
                  >
                    Use a different phone number
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
