// app/auth/verification-success/page.tsx
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { MountainIcon, CheckCircle } from 'lucide-react';

export default function VerificationSuccessPage() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <MountainIcon className="h-6 w-6 text-blue-500" />
          <span className="ml-2 text-xl font-bold">VC Vantage</span>
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="text-3xl font-bold">Email Verified!</h1>
          <p className="text-gray-600">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <Link href="/auth">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500">
        © 2024 VC Vantage. All rights reserved.
      </footer>
    </div>
  );
}

