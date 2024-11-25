// app/reports/ReportsClientComponent.tsx

'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import UserDropdown from '@/components/UserDropdown';
import {
  FileText,
  MountainIcon,
  Search,
  Settings,
  Moon,
  Sun,
  TrendingUp,
  DollarSign,
  PieChart,
  ClipboardCheck, // Use this instead of ClipboardList
} from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';

import { Components } from 'react-markdown';

type MarkdownComponents = Components;

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

  const [isDarkMode, setIsDarkMode] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const queryParam = searchParams.get('query');
  const typeParam = searchParams.get('type');

  // Ref to track if URL has been replaced
  const hasReplacedRef = useRef(false);

  // Function to perform the search and store results
  const performSearch = async (query: string, type: 'people' | 'company') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText} - ${text}`
        );
      }
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'An error occurred while fetching results.');
      } else {
        setResults(data);
        // Update localStorage with the latest search
        localStorage.setItem('lastSearch', JSON.stringify({ query, type }));
      }
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to fetch results. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'loading') return;
    if (!session) {
      signIn();
      return;
    }

    const fetchResults = async () => {
      // Check if query and type are present in URL
      if (queryParam && (typeParam === 'people' || typeParam === 'company')) {
        performSearch(queryParam, typeParam as 'people' | 'company');
      } else {
        // Attempt to retrieve last search from localStorage
        const lastSearch = localStorage.getItem('lastSearch');
        if (lastSearch && !hasReplacedRef.current) {
          try {
            const { query, type } = JSON.parse(lastSearch);
            if (query && (type === 'people' || type === 'company')) {
              // Update the URL with stored parameters without adding to history
              hasReplacedRef.current = true; // Set the flag before replacing
              router.replace(`/reports?query=${encodeURIComponent(query)}&type=${type}`);
              performSearch(query, type);
              return;
            }
          } catch (e) {
            console.error('Error parsing lastSearch from localStorage:', e);
          }
        }
        setError('Invalid search parameters.');
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [queryParam, typeParam, session, status, router]);

  // Load dark mode preference on initial render
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDarkMode(storedTheme === 'dark');
  }, []);

  // Apply dark mode class to <html> element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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

  const handleExportPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) {
      alert('Report content not found.');
      return;
    }
    if (!queryParam) {
      alert('Cannot export PDF: Missing query parameter.');
      return;
    }
    const filename = `${queryParam}_Report.pdf`; // Safe to use as we checked above
    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().set(opt).from(element).save();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Update markdownComponents
  const markdownComponents: MarkdownComponents = {
    h1: ({ ...props }) => (
      <h1
        className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="text-2xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-200"
        {...props}
      />
    ),
    h3: ({ ...props }) => (
      <h3
        className="text-xl font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300"
        {...props}
      />
    ),
    p: ({ ...props }) => (
      <p className="mt-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: ({ ...props }) => (
      <li className="ml-6 list-disc text-gray-700 dark:text-gray-300" {...props} />
    ),
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4">
          <Link href="/" className="flex items-center space-x-2">
            <MountainIcon className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              VC Vantage
            </span>
          </Link>
        </div>
        <nav className="mt-6">
          <Link
            href="/search"
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
          <Link
            href="/reports"
            className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800"
          >
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Reports
            </h1>
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle button */}
              <button
                onClick={toggleDarkMode}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow p-8">
              <Spinner className="w-16 h-16 text-blue-500 mb-4" />
              <p className="text-xl text-gray-700 dark:text-gray-200">
                Fetching detailed analysis, please wait...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center h-full bg-red-100 dark:bg-red-900 rounded-lg shadow p-8">
              <p className="text-red-600 dark:text-red-300 text-xl mb-4">
                {error}
              </p>
              <Link href="/search">
                <Button className="mt-2 px-6 py-3">Back to Search</Button>
              </Link>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && !error && !results && (
            <div className="flex flex-col items-center justify-center h-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow p-8">
              <p className="text-gray-700 dark:text-gray-200 text-xl mb-4">
                No results found.
              </p>
              <Link href="/search">
                <Button className="mt-2 px-6 py-3">Back to Search</Button>
              </Link>
            </div>
          )}

          {/* Display Results */}
          {results && (
            <div id="report-content" className="space-y-8">
              {/* Header with Branding */}
              <header className="flex flex-col items-center justify-between mb-8">
                <div className="flex items-center">
                  <h1 className="text-4xl font-bold ml-4 text-blue-600 dark:text-blue-400">
                    Who Is...
                  </h1>
                  <span className="text-4xl font-bold ml-2 text-gray-800 dark:text-gray-100">
                    {queryParam}
                  </span>
                </div>
                <div className="flex space-x-4 mt-4">
                  <Button onClick={handleExportPDF} className="px-6 py-3">
                    Download PDF
                  </Button>
                  <Link href="/search">
                    <Button className="px-6 py-3">Back to Search</Button>
                  </Link>
                </div>
              </header>

              {/* Table of Contents */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Table of Contents
                </h2>
                <ul className="list-decimal list-inside mt-4 space-y-2">
                  <li>
                    <a
                      href="#overview"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Overview
                    </a>
                  </li>
                  <li>
                    <a
                      href="#market-analysis"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Market Analysis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#financial-analysis"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Financial Analysis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#strategic-analysis"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Strategic Analysis
                    </a>
                  </li>
                  <li>
                    <a
                      href="#summary"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Summary and Key Questions
                    </a>
                  </li>
                </ul>
              </div>

              {/* Report Sections */}
              <section id="overview">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <FileText className="h-6 w-6 mr-2" /> Overview
                </h2>
                <div className="prose prose-lg dark:prose-dark max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {results.overview}
                  </ReactMarkdown>
                </div>
              </section>

              <section id="market-analysis">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <TrendingUp className="h-6 w-6 mr-2" /> Market Analysis
                </h2>
                <div className="prose prose-lg dark:prose-dark max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {results.marketAnalysis}
                  </ReactMarkdown>
                </div>
              </section>

              <section id="financial-analysis">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <DollarSign className="h-6 w-6 mr-2" /> Financial Analysis
                </h2>
                <div className="prose prose-lg dark:prose-dark max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {results.financialAnalysis}
                  </ReactMarkdown>
                </div>
              </section>

              <section id="strategic-analysis">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <PieChart className="h-6 w-6 mr-2" /> Strategic Analysis
                </h2>
                <div className="prose prose-lg dark:prose-dark max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {results.strategicAnalysis}
                  </ReactMarkdown>
                </div>
              </section>

              <section id="summary">
                <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900 dark:text-white">
                  <ClipboardCheck className="h-6 w-6 mr-2" /> Summary and Key Questions
                </h2>
                <div className="prose prose-lg dark:prose-dark max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {results.summary}
                  </ReactMarkdown>
                </div>
                {results.keyQuestions.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      Key Questions
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {results.keyQuestions.map((question, index) => (
                        <li
                          key={index}
                          className="text-gray-700 dark:text-gray-300"
                        >
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>
            )}
          </div>
          </main>
        </div>
      );
    }
