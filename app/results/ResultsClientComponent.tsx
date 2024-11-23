// app/results/ResultsClientComponent.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Spinner from '@/components/ui/Spinner';
import UserDropdown from '@/components/UserDropdown';
import { FileText, MountainIcon, Search, Settings } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

interface SearchResults {
  // Define your expected structure
  overview: string
  marketAnalysis: string
  financialAnalysis: string
  strategicAnalysis: string
  summary: string
  keyQuestions: string[]
}

export default function ResultsClientComponent() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') as 'option1' | 'option2' | undefined;

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      signIn();
      return;
    }

    const fetchResults = async () => {
      if (!query || !type) {
        setError('Invalid search parameters.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, type }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'An error occurred while fetching results.');
        } else {
          setResults(data);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to fetch results. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, type, session, status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <MountainIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-900">VC Vantage</span>
          </Link>
        </div>
        <nav className="mt-6">
          <Link
            href="/search"
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
          <Link
            href="/reports"
            className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Results</h1>
            <div className="flex items-center space-x-4">
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Loading, Error, No Results, and Display Results similar to Reports */}
            {/* Implement as per your requirements */}
          </div>
        </div>
      </main>
    </div>
  );
}
