// app/auth/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from "next-auth/react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MountainIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Destructure only 'status' to avoid unused variable
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/search');
    }
  }, [status, router]);

  // State variables for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State variables for Registration
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: loginEmail,
        password: loginPassword,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push('/search');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (registerPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Registration API Error:', data);
        setError(data.message || 'Something went wrong.');
        return;
      }

      // Automatically sign in after successful registration
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: registerEmail,
        password: registerPassword,
      });

      if (signInRes?.error) {
        setError(signInRes.error);
      } else {
        router.push('/search');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Frontend Registration Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-xl font-bold">VC Vantage</span>
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">LOG IN</TabsTrigger>
              <TabsTrigger value="register">REGISTER</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'LOG IN'}
                </Button>
                <Link href="/forgot-password">
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-blue-500 hover:text-blue-600"
                  >
                    Forgot password?
                  </Button>
                </Link>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'CREATE ACCOUNT'}
                </Button>
              </form>
            </TabsContent>

            {error && (
              <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
            )}

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  onClick={() => signIn('google', { callbackUrl: '/search' })} // Specifying callbackUrl
                >
                  {/* Google SVG */}
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M21.35 11.1h-9.17v2.95h5.44c-.24 1.27-1.3 3.69-5.44 3.69-3.27 0-5.94-2.66-5.94-5.94s2.67-5.94 5.94-5.94c1.94 0 3.24.82 3.99 1.52l2.73-2.64C16.52 3.09 14.04 2 11.35 2c-5.33 0-9.7 4.37-9.7 9.7s4.37 9.7 9.7 9.7c5.16 0 8.89-3.48 9.59-8.11l-9.59-.01z"/>
                  </svg>
                  Log in with Google
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  onClick={() => signIn('linkedin', { callbackUrl: '/search' })} // Specifying callbackUrl
                >
                  {/* LinkedIn SVG */}
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 
                    2.239 5 5 5h14c2.761 0 5-2.239 
                    5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 
                    0-1.75-.784-1.75-1.75s.784-1.75 
                    1.75-1.75 1.75.784 1.75 
                    1.75-.784 1.75-1.75 1.75zm13.5 
                    11.268h-3v-5.604c0-1.337-.026-3.063-1.867-3.063-1.869 
                    0-2.155 1.459-2.155 2.967v5.7h-3v-10h2.88v1.367h.041c.401-.76 
                    1.379-1.562 2.84-1.562 3.04 0 3.6 2.0 
                    3.6 4.6v5.6z"/>
                  </svg>
                  Log in with LinkedIn
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm" 
                  onClick={() => signIn('sso', { callbackUrl: '/search' })} // Implement SSO as needed
                >
                  Log In With Single Sign-on
                </Button>
                <Button 
                  variant="link" 
                  className="text-sm" 
                  onClick={() => {
                    // Implement "Send Me a Login Link" functionality
                    console.log('Send login link');
                  }}
                >
                  Send Me a Login Link
                </Button>
              </div>
            </div>
          </Tabs>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        © 2024 VC Vantage. All rights reserved.
      </footer>
    </div>
  )
}
