// app/reports/saved/ReportsList.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';
import UserDropdown from '@/components/UserDropdown';
import {
  Moon,
  Sun,
} from 'lucide-react';
import { useSession, signIn } from 'next-auth/react';
import { useReportsStore } from '@/store/reportsStore';
import Sidebar from '@/components/Sidebar';

export default function ReportsList() {
  const { data: session, status } = useSession();
  const { reports, isLoading, error, fetchAllReports } = useReportsStore();

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Redirect to sign-in if not authenticated
    if (status === 'loading') return;
    if (!session) {
      signIn();
      return;
    }

    if (!reports && !isLoading && !error) {
      fetchAllReports();
    }
  }, [session, status, reports, isLoading, error, fetchAllReports]);

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

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return null; // Prevent flash of unauthenticated content
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-100 dark:bg-red-900 rounded-lg shadow p-8">
        <p className="text-red-600 dark:text-red-300 text-xl mb-4">
          {error}
        </p>
        <Button onClick={() => fetchAllReports()} className="mt-2 px-6 py-3">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />
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
                onClick={() => setIsDarkMode(!isDarkMode)}
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
          {/* List of Reports */}
          {reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {report.query} ({report.type})
                    </h2>
                    <p className="text-gray-500 dark:text-gray-300">
                      Created at: {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Link href={`/reports/${report.id}`}>
                    <Button className="px-4 py-2">View Report</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow p-8">
              <p className="text-gray-700 dark:text-gray-200 text-xl mb-4">
                No reports found. Start by creating a new report.
              </p>
              <Link href="/search">
                <Button className="mt-2 px-6 py-3">Back to Search</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
