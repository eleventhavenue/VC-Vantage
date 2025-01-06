'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MountainIcon } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('If an account exists with this email, you will receive password reset instructions.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
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
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-gray-500">
              Enter your email address and we'll send you instructions to reset your password.
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
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
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