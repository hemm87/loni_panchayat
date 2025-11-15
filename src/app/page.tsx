
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
import { isAdminEmail } from '@/lib/utils';


async function updateUserOnLogin(result: UserCredential) {
  const { firestore } = initializeFirebase();
  if (!firestore) throw new Error("Firestore not initialized");

  const user = result.user;
  const userRef = doc(firestore, 'users', user.uid);
  const now = new Date().toISOString();
  const adminUser = isAdminEmail(user.email || undefined);

  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const existingRole = docSnap.data()?.role;
      const roleToSave = adminUser ? 'admin' : existingRole || 'viewer';
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: roleToSave,
        lastLogin: now,
      }, { merge: true });
    } else {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: adminUser ? 'admin' : 'viewer',
        createdAt: now,
        lastLogin: now,
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-gradient-to-br from-background to-muted/20">
      <div className="hidden bg-gradient-to-br from-primary/5 to-primary/10 lg:flex">
        <div className="flex flex-col h-full p-8 lg:p-12 justify-between w-full">
            <Link href="/" className="flex items-center gap-3 font-bold text-2xl lg:text-3xl text-foreground hover:text-primary transition-colors">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Building className="h-7 w-7" />
                </div>
                <span>Loni Panchayat Tax Manager</span>
            </Link>
            <div className="flex-1 flex items-center justify-center">
              <Image
                  src="https://picsum.photos/seed/login-village/1200/800"
                  alt="Indian Village"
                  width="1200"
                  height="800"
                  data-ai-hint="indian village"
                  className="rounded-2xl object-cover shadow-2xl border-4 border-white/50 max-w-full h-auto"
              />
            </div>
            <div className="text-base lg:text-lg text-center lg:text-left">
                <blockquote className="italic text-muted-foreground">
                    "The best way to find yourself is to lose yourself in the service of others."
                </blockquote>
                <p className="font-semibold mt-2 text-foreground">- Mahatma Gandhi</p>
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-8 px-4 min-h-screen">
        <div className="mx-auto grid w-full max-w-md gap-8 bg-white p-8 rounded-2xl shadow-xl border border-border/50">
          <div className="grid gap-3 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-4 rounded-full">
                <Building className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Select a method to access the dashboard
            </p>
          </div>
            <Tabs defaultValue="email">
                <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger value="email" className="font-semibold">Email</TabsTrigger>
                    <TabsTrigger value="phone" className="font-semibold">Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                <div className="grid gap-5 pt-4">
                    <div className="grid gap-2">
                    <Label htmlFor="email" className="font-semibold text-foreground">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        disabled={loading}
                        className="h-11 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    </div>
                    <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password" className="font-semibold text-foreground">Password</Label>
                        <Link
                        href="#"
                        tabIndex={-1}
                        className="ml-auto inline-block text-sm underline text-muted-foreground opacity-50 cursor-not-allowed"
                        >
                        Forgot password?
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={loading}
                        className="h-11 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    </div>
                    <Button
                    onClick={handleEmailLogin}
                    disabled={loading}
                    className="w-full h-11 font-semibold text-base hover:shadow-md"
                    >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                    </Button>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground font-medium">Or continue with</span>
                      </div>
                    </div>
                    <Button
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full h-11 border-2 font-semibold hover:bg-muted/50"
                    >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login with Google
                    </Button>
                </div>
                </TabsContent>
                <TabsContent value="phone">
                {!otpSent ? (
                    <div className="grid gap-5 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="font-semibold text-foreground">Phone Number</Label>
                        <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        disabled={loading}
                        className="h-11 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <Button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full h-11 font-semibold text-base hover:shadow-md"
                    >
                        {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Send OTP
                    </Button>
                    </div>
                ) : (
                    <div className="grid gap-5 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="otp" className="font-semibold text-foreground">Enter OTP</Label>
                        <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        required
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        disabled={loading}
                        className="h-11 border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <Button
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full h-11 font-semibold text-base hover:shadow-md"
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
                        className="text-primary hover:text-primary/80 font-medium"
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
