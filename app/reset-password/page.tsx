// app/reset-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MountainIcon, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validatePassword } from '@/lib/password-utils';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [strength, setStrength] = useState<{
    score: number;
    feedback: string[];
    isStrong: boolean;
  }>({ score: 0, feedback: [], isStrong: false });
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid reset token');
    }
  }, [token]);

  // Check password strength on input
  useEffect(() => {
    if (password) {
      const result = validatePassword(password);
      setStrength(result);
    } else {
      setStrength({ score: 0, feedback: [], isStrong: false });
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (!strength.isStrong) {
      setStatus('error');
      setMessage('Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Password reset successful. Redirecting to login...');
        setTimeout(() => {
          router.push('/auth');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (score: number) => {
    if (score < 4) return 'bg-red-500';
    if (score < 7) return 'bg-yellow-500';
    return 'bg-green-500';
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
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Reset Your Password</h1>
            <p className="text-gray-500">
              Enter your new password below.
            </p>
          </div>

          {status !== 'idle' && (
            <Alert variant={status === 'success' ? 'default' : 'destructive'}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || status === 'success'}
                minLength={8}
                className="w-full"
              />
              
              {/* Password strength indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor(strength.score)} transition-all duration-300`}
                      style={{ width: `${strength.score * 10}%` }}
                    />
                  </div>
                  <ul className="space-y-1">
                    {strength.feedback.map((feedback, index) => (
                      <li key={index} className="text-sm flex items-center text-gray-600">
                        {strength.isStrong ? (
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
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || status === 'success'}
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || status === 'success' || !strength.isStrong}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/auth"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        © 2024 VC Vantage. All rights reserved.
      </footer>
    </div>
  );
}