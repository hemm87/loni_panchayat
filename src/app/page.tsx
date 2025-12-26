
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { Loader2, Mail, Phone, Lock, ArrowRight, Shield, Users, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { isAdminEmail, isSuperAdmin } from '@/lib/utils';


async function updateUserOnLogin(result: UserCredential) {
  const { firestore } = initializeFirebase();
  if (!firestore) throw new Error("Firestore not initialized");

  const user = result.user;
  const userRef = doc(firestore, 'users', user.uid);
  const now = new Date().toISOString();
  const userIsSuperAdmin = isSuperAdmin(user.email || undefined);
  const adminUser = isAdminEmail(user.email || undefined);

  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // Existing user - preserve their role unless they're super admin
      const existingData = docSnap.data();
      const existingRole = existingData?.role;
      
      // Super admin always gets super-admin role
      // Otherwise preserve manually set role, fallback to admin check, then viewer
      let roleToSave = existingRole || 'viewer';
      if (userIsSuperAdmin) {
        roleToSave = 'super-admin';
      } else if (!existingRole && adminUser) {
        roleToSave = 'admin';
      }
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || existingData?.displayName,
        photoURL: user.photoURL,
        role: roleToSave,
        lastLogin: now,
        isActive: existingData?.isActive !== false, // Preserve isActive status
      }, { merge: true });
    } else {
      // New user - determine role
      let role = 'viewer';
      if (userIsSuperAdmin) {
        role = 'super-admin';
      } else if (adminUser) {
        role = 'admin';
      }
      
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role,
        createdAt: now,
        lastLogin: now,
        isActive: true,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#3949ab] to-[#5c6bc0] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>मध्य प्रदेश शासन | Government of Madhya Pradesh</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>📞 Helpline: 0755-2700800</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md border-b-4 border-[#3949ab]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20">
                <img src="/logo.png" alt="Panchayat Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#3949ab]">ग्राम पंचायत लोनी</h1>
                <p className="text-sm md:text-base text-gray-600">Gram Panchayat Loni - Tax Collection Portal</p>
                <p className="text-xs text-gray-500">जिला बुरहानपुर, मध्य प्रदेश</p>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <p className="text-sm text-gray-500">कर संग्रह प्रबंधन प्रणाली</p>
              <p className="text-xs text-gray-400">Tax Collection Management System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Side - Info Section */}
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-[#3949ab] to-[#5c6bc0] rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">स्वागत है!</h2>
              <h3 className="text-xl md:text-2xl font-semibold mb-2">Welcome to Loni Gram Panchayat</h3>
              <p className="text-blue-100 mb-6">
                ग्राम पंचायत लोनी के कर संग्रह पोर्टल में आपका स्वागत है। इस पोर्टल के माध्यम से आप संपत्ति कर, जल कर एवं अन्य करों का भुगतान कर सकते हैं।
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                  <span className="font-bold">24/7</span> Online Service
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                  <span className="font-bold">100%</span> Secure
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#3949ab]" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">कर प्रबंधन</h4>
                <p className="text-sm text-gray-500">Tax Management</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">संपत्ति रजिस्ट्री</h4>
                <p className="text-sm text-gray-500">Property Registry</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">सुरक्षित भुगतान</h4>
                <p className="text-sm text-gray-500">Secure Payments</p>
              </div>
            </div>

            {/* Quote */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-400 rounded-r-xl p-5">
              <blockquote className="text-gray-700 italic mb-2">
                "ग्राम स्वराज्य ही सच्चा स्वराज्य है।"
              </blockquote>
              <p className="text-sm text-gray-600">- महात्मा गांधी</p>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Login Header */}
              <div className="bg-gradient-to-r from-[#3949ab] to-[#5c6bc0] p-6 text-white text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Lock className="w-8 h-8 text-[#3949ab]" />
                </div>
                <h2 className="text-2xl font-bold">Admin Login</h2>
                <p className="text-blue-100 mt-1">प्रशासनिक लॉगिन</p>
              </div>

              {/* Login Form */}
              <div className="p-6 md:p-8">
                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-12 mb-6 bg-gray-100">
                    <TabsTrigger value="email" className="font-semibold data-[state=active]:bg-[#3949ab] data-[state=active]:text-white gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="font-semibold data-[state=active]:bg-[#3949ab] data-[state=active]:text-white gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="email">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold text-gray-700">
                          Email Address / ईमेल पता
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                            className="h-12 pl-11 border-2 focus:border-[#3949ab] focus:ring-2 focus:ring-[#3949ab]/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="font-semibold text-gray-700">
                            Password / पासवर्ड
                          </Label>
                          <Link href="#" className="text-sm text-[#3949ab] hover:underline">
                            Forgot?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                            className="h-12 pl-11 border-2 focus:border-[#3949ab] focus:ring-2 focus:ring-[#3949ab]/20"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleEmailLogin}
                        disabled={loading}
                        className="w-full h-12 bg-[#3949ab] hover:bg-[#303f9f] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <ArrowRight className="mr-2 h-5 w-5" />
                        )}
                        Login / लॉगिन करें
                      </Button>
                      
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t-2 border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-4 text-gray-500 font-medium">या / OR</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full h-12 border-2 font-semibold hover:bg-gray-50 gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="phone">
                    {!otpSent ? (
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-semibold text-gray-700">
                            Phone Number / मोबाइल नंबर
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+91 98765 43210"
                              required
                              value={phoneNumber}
                              onChange={e => setPhoneNumber(e.target.value)}
                              disabled={loading}
                              className="h-12 pl-11 border-2 focus:border-[#3949ab] focus:ring-2 focus:ring-[#3949ab]/20"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="w-full h-12 bg-[#3949ab] hover:bg-[#303f9f] text-white font-semibold text-base shadow-lg"
                        >
                          {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <ArrowRight className="mr-2 h-5 w-5" />
                          )}
                          Send OTP / OTP भेजें
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <p className="text-green-700 font-medium">OTP sent to {phoneNumber}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="otp" className="font-semibold text-gray-700">
                            Enter OTP / OTP दर्ज करें
                          </Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder="123456"
                            required
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            disabled={loading}
                            className="h-12 text-center text-2xl tracking-widest border-2 focus:border-[#3949ab]"
                          />
                        </div>
                        <Button
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className="w-full h-12 bg-[#3949ab] hover:bg-[#303f9f] text-white font-semibold text-base shadow-lg"
                        >
                          {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          ) : (
                            <ArrowRight className="mr-2 h-5 w-5" />
                          )}
                          Verify OTP / सत्यापित करें
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => {
                            setOtpSent(false);
                            setPhoneNumber('');
                            setOtp('');
                          }}
                          disabled={loading}
                          className="w-full text-[#3949ab]"
                        >
                          ← Change Phone Number
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                <div id="recaptcha-container"></div>
              </div>

              {/* Footer Note */}
              <div className="bg-gray-50 px-6 py-4 text-center border-t">
                <p className="text-xs text-gray-500">
                  🔒 Your data is secured with end-to-end encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#3949ab] text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-bold mb-3">ग्राम पंचायत लोनी</h4>
              <p className="text-blue-200 text-sm">
                जिला बुरहानपुर, मध्य प्रदेश<br/>
                District Burhanpur, Madhya Pradesh
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Quick Links</h4>
              <div className="space-y-1 text-sm text-blue-200">
                <p>Panchayat Darpan Portal</p>
                <p>MP Government</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3">Contact</h4>
              <p className="text-blue-200 text-sm">
                📧 contact@lonipanchayat.in<br/>
                📞 Helpline: 0755-2700800
              </p>
            </div>
          </div>
          <div className="border-t border-blue-400 mt-6 pt-6 text-center text-sm text-blue-200">
            <p>© 2024 Gram Panchayat Loni. All rights reserved.</p>
          </div>
        </div>
      </footer>
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
