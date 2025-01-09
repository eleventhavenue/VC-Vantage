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
import { MountainIcon, Check, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { validatePassword } from '@/lib/password-utils';

export default function AuthPage() {
  const router = useRouter();
  const { status } = useSession();

  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    isStrong: boolean;
  }>({ score: 0, feedback: [], isStrong: false });

  // Helper functions
  const getStrengthColor = (score: number) => {
    if (score < 4) return 'bg-red-500';
    if (score < 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Effects
  useEffect(() => {
    if (status === "authenticated") {
      router.push('/search');
    }
  }, [status, router]);

  useEffect(() => {
    if (registerPassword) {
      const result = validatePassword(registerPassword);
      setPasswordStrength(result);
    } else {
      setPasswordStrength({ score: 0, feedback: [], isStrong: false });
    }
  }, [registerPassword]);

  // Event handlers
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

    if (!passwordStrength.isStrong) {
      setError('Please choose a stronger password');
      setIsLoading(false);
      return;
    }

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
                  {/* Password strength indicator */}
                  {registerPassword && (
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor(passwordStrength.score)} transition-all duration-300`}
                          style={{ width: `${passwordStrength.score * 10}%` }}
                        />
                      </div>
                      <ul className="space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index} className="text-sm flex items-center text-gray-600">
                            {passwordStrength.isStrong ? (
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <X className="h-4 w-4 text-red-500 mr-2" />
                            )}
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || !passwordStrength.isStrong}
                >
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
                  onClick={() => signIn('google', { callbackUrl: '/search' })}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path d="M21.35 11.1h-9.17v2.95h5.44c-.24 1.27-1.3 3.69-5.44 3.69-3.27 0-5.94-2.66-5.94-5.94s2.67-5.94 5.94-5.94c1.94 0 3.24.82 3.99 1.52l2.73-2.64C16.52 3.09 14.04 2 11.35 2c-5.33 0-9.7 4.37-9.7 9.7s4.37 9.7 9.7 9.7c5.16 0 8.89-3.48 9.59-8.11l-9.59-.01z"/>
                  </svg>
                  Log in with Google
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
  );
}