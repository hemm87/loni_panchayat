
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
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
import { Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc, setDoc } from 'firebase/firestore';


async function updateUserOnLogin(result: UserCredential) {
  const { firestore } = initializeFirebase();
  if (!firestore) throw new Error("Firestore not initialized");

  const user = result.user;
  const userRef = doc(firestore, 'users', user.uid);
  
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // If user exists, just update last login
      await setDoc(userRef, {
        lastLogin: new Date().toISOString(),
      }, { merge: true });
    } else {
      // If new user, create their profile with a default 'viewer' role
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'viewer', // Default role for new sign-ups
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error("Error updating user document: ", error);
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [email, setEmail] = useState('admin@lonipanchayat.in');
  const [password, setPassword] = useState('password123');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  
  // Set up auth listener without using the hook
  useEffect(() => {
    const { auth } = initializeFirebase();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const { auth } = initializeFirebase();
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
        const menu = searchParams.get('menu');
        if (menu === 'register') {
            router.push('/dashboard?menu=register');
        } else {
            router.push('/dashboard');
        }
    }
  }, [user, userLoading, router, searchParams]);

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
      let formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
      if (!formattedPhoneNumber.startsWith('91') && formattedPhoneNumber.length === 10) {
        formattedPhoneNumber = `+91${formattedPhoneNumber}`;
      } else if (!formattedPhoneNumber.startsWith('+')) {
        formattedPhoneNumber = `+${formattedPhoneNumber}`;
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <div className="flex flex-col h-full p-12 justify-between">
            <Link href="/" className="flex items-center gap-3 font-bold text-2xl text-foreground">
                <Building className="h-8 w-8 text-primary" />
                Loni Panchayat Tax Manager
            </Link>
            <Image
                src="https://picsum.photos/seed/login-village/1200/800"
                alt="Indian Village"
                width="1200"
                height="800"
                data-ai-hint="indian village"
                className="rounded-xl object-cover shadow-2xl"
            />
            <div className="text-lg">
                <blockquote className="italic">
                    "The best way to find yourself is to lose yourself in the service of others."
                </blockquote>
                <p className="font-bold mt-2">- Mahatma Gandhi</p>
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <div className="mx-auto grid w-full max-w-sm gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline">Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Select a method to access the dashboard
            </p>
          </div>
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
                        tabIndex={-1}
                        className="ml-auto inline-block text-sm underline opacity-50 cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <LoginPageContent />
        </React.Suspense>
    )
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
