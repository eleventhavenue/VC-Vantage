// app/reports/ReportsClientComponent.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import UserDropdown from '@/components/UserDropdown';
import { FileText, MountainIcon, Search, Settings } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';

interface SearchResults {
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

export default function ReportsClientComponent() {
  const { data: session, status } = useSession();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const type = searchParams.get('type') as 'people' | 'company' | undefined;

  useEffect(() => {
    // Redirect to sign-in if not authenticated
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
        const response = await fetch('/api/search', {
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
    return null; // Prevent flash of unauthenticated content
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
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <div className="flex items-center space-x-4">
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow p-8">
                <Spinner className="w-16 h-16 text-blue-500 mb-4" />
                <p className="text-xl text-gray-700">Fetching detailed analysis, please wait...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center h-full bg-red-100 rounded-lg shadow p-8">
                <p className="text-red-600 text-xl mb-4">{error}</p>
                <Link href="/search">
                  <Button className="mt-2 px-6 py-3">Back to Search</Button>
                </Link>
              </div>
            )}

            {/* No Results State */}
            {!isLoading && !error && !results && (
              <div className="flex flex-col items-center justify-center h-full bg-gray-200 rounded-lg shadow p-8">
                <p className="text-gray-700 text-xl mb-4">No results found.</p>
                <Link href="/search">
                  <Button className="mt-2 px-6 py-3">Back to Search</Button>
                </Link>
              </div>
            )}

            {/* Display Results */}
            {results && (
              <div className="space-y-8">
                {/* Header with Branding */}
                <header className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    {/* Replace '/logo.png' with your actual logo path */}

                    <h1 className="text-3xl font-bold ml-4 text-blue-600">Who Is...</h1>
                    <span className="text-3xl font-bold ml-2 text-gray-800">{query}</span>
                  </div>
                  <Link href="/search">
                    <Button className="px-6 py-3">Back to Search</Button>
                  </Link>
                </header>

                {/* Accordion for Sections */}
                <Accordion>
                  {/* Overview Section */}
                  <AccordionItem title="Overview">
                    <div className="prose prose-lg max-w-none">
                      {results.overview}
                    </div>
                  </AccordionItem>

                  {/* Market Analysis Section */}
                  <AccordionItem title="Market Analysis">
                    <div className="prose prose-lg max-w-none">
                      {results.marketAnalysis}
                    </div>
                  </AccordionItem>

                  {/* Financial Analysis Section */}
                  <AccordionItem title="Financial Analysis">
                    <div className="prose prose-lg max-w-none">
                      {results.financialAnalysis}
                    </div>
                  </AccordionItem>

                  {/* Strategic Analysis Section */}
                  <AccordionItem title="Strategic Analysis">
                    <div className="prose prose-lg max-w-none">
                      {results.strategicAnalysis}
                    </div>
                  </AccordionItem>

                  {/* Summary and Key Questions Section */}
                  <AccordionItem title="Summary and Key Questions">
                    <div className="prose prose-lg max-w-none">
                      {results.summary}
                    </div>
                    {results.keyQuestions.length > 0 && (
                      <div className="mt-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Key Questions</h2>
                        <ul className="list-disc list-inside space-y-2">
                          {results.keyQuestions.map((question, index) => (
                            <li key={index} className="text-gray-700">
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
