'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MountainIcon,
  Search,
  FileText,
  Settings,
  Building2,
  UserSearch,
  Moon,
  Sun,
} from 'lucide-react';
import UserDropdown from '@/components/UserDropdown';

export default function SearchPage() {
  const [peopleQuery, setPeopleQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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

  // Load dark mode preference on initial render
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDarkMode(storedTheme === 'dark');
  }, []);

  const handleSearch = async (
    e: React.FormEvent,
    type: 'people' | 'company'
  ) => {
    e.preventDefault();
    const query = type === 'people' ? peopleQuery : companyQuery;
    if (isLoading) return;
    if (query.trim() === '') {
      alert('Please enter a valid search query.');
      return;
    }
    setIsLoading(true);
    try {
      await router.push(
        `/reports?query=${encodeURIComponent(query)}&type=${type}`
      );
    } catch (error) {
      console.error('Error performing search:', error);
      alert(
        'An error occurred while performing the search. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
            className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900 dark:hover:bg-blue-800"
          >
            <Search className="h-5 w-5 mr-3" />
            Search
          </Link>
          <Link
            href="/reports"
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Search
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

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="max-w-3xl mx-auto space-y-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                AI-Powered Research for Venture Capitalists
              </h2>
              <p className="mt-3 text-xl text-gray-500 dark:text-gray-300">
                Unlock the power of AI to perform in-depth due diligence on
                individuals and companies. Get accurate, comprehensive research
                to inform your investment decisions.
              </p>
              <Tabs defaultValue="people" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="people">People</TabsTrigger>
                  <TabsTrigger value="companies">Companies</TabsTrigger>
                </TabsList>
                <TabsContent value="people">
                  <form
                    onSubmit={(e) => handleSearch(e, 'people')}
                    className="mt-8 space-y-3"
                  >
                    <div className="flex items-center">
                      <UserSearch className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <Input
                        type="text"
                        placeholder="Search for a person"
                        className="block w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        value={peopleQuery}
                        onChange={(e) => setPeopleQuery(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isLoading ? 'Searching...' : 'Search People'}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="companies">
                  <form
                    onSubmit={(e) => handleSearch(e, 'company')}
                    className="mt-8 space-y-3"
                  >
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <Input
                        type="text"
                        placeholder="Search for a company"
                        className="block w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        value={companyQuery}
                        onChange={(e) => setCompanyQuery(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isLoading ? 'Searching...' : 'Search Companies'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Our AI-powered research provides deep insights to support your
                due diligence process.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
