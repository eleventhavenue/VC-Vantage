// app/search/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Building2,
  UserSearch,
  Moon,
  Sun,
  // Removed unused imports: CheckCircle, XCircle
  Search as SearchIcon, // Renamed to avoid conflicts
} from 'lucide-react';
import UserDropdown from '@/components/UserDropdown';
import Modal from '@/components/Modal'; // Assuming you have a Modal component
// Removed FeedbackModal import as it's not used here
import Sidebar from '@/components/Sidebar';

export default function SearchPage() {
  const [peopleQuery, setPeopleQuery] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [peopleCompany, setPeopleCompany] = useState('');
  const [peopleTitle, setPeopleTitle] = useState('');
  const [companyTitle, setCompanyTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Disambiguation state
  const [needDisambiguation, setNeedDisambiguation] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<'people' | 'company' | null>(null);

  // Removed Feedback state variables as they're not used here

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
    const company = type === 'people' ? peopleCompany : companyQuery; // For 'company' type, use companyQuery
    const title = type === 'people' ? peopleTitle : companyTitle;

    if (isLoading) return;
    if (query.trim() === '') {
      alert('Please enter a valid search query.');
      return;
    }

    setIsLoading(true);
    setCurrentType(type); // Keep track of current type for suggestions

    try {
      if (needDisambiguation) {
        // Step 1: Request disambiguation suggestions
        const disambiguationResponse = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            type,
            context: {
              company: company.trim() !== '' ? company : undefined,
              title: title.trim() !== '' ? title : undefined,
            },
            disambiguate: true,
          }),
        });

        const disambiguationData = await disambiguationResponse.json();

        if (disambiguationResponse.ok) {
          if (disambiguationData.suggestions && disambiguationData.suggestions.length > 0) {
            setSuggestions(disambiguationData.suggestions);
            setIsSuggestionModalOpen(true);
          } else {
            alert('No disambiguation suggestions found.');
          }
        } else {
          alert(disambiguationData.error || 'Error during disambiguation.');
        }
      } else {
        // Step 2: Perform the actual search
        await performSearch(query, type, company, title);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      alert('An error occurred while performing the search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (
    query: string,
    type: 'people' | 'company',
    company?: string,
    title?: string
  ) => {
    try {
      // Store the last search parameters in localStorage
      localStorage.setItem(
        'lastSearch',
        JSON.stringify({ query, type, company, title })
      );

      // Navigate to the reports page with the selected or refined query
      await router.push(
        `/reports?query=${encodeURIComponent(query)}&type=${type}${
          company ? `&company=${encodeURIComponent(company)}` : ''
        }${title ? `&title=${encodeURIComponent(title)}` : ''}`
      );
    } catch (error) {
      console.error('Error navigating to reports:', error);
      alert('An error occurred while navigating to the report. Please try again.');
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setIsSuggestionModalOpen(false);
    setIsLoading(true);
    try {
      if (currentType) {
        await performSearch(suggestion, currentType, undefined, undefined); // Assuming suggestion includes necessary context
      } else {
        // If currentType is null, default to 'people'
        await performSearch(suggestion, 'people', undefined, undefined);
      }
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      alert('An error occurred while selecting the suggestion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleFeedback and closeFeedbackModal as they're not used here

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

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
                  <TabsTrigger value="company">Companies</TabsTrigger>
                </TabsList>
                <TabsContent value="people">
                  <form
                    onSubmit={(e) => handleSearch(e, 'people')}
                    className="mt-8 space-y-3"
                  >
                    <div className="flex flex-col space-y-3">
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
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <Input
                          type="text"
                          placeholder="Company (optional)"
                          className="block w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                          value={peopleCompany}
                          onChange={(e) => setPeopleCompany(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <Input
                          type="text"
                          placeholder="Title (optional)"
                          className="block w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                          value={peopleTitle}
                          onChange={(e) => setPeopleTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="disambiguate-people"
                          checked={needDisambiguation}
                          onChange={(e) => setNeedDisambiguation(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="disambiguate-people" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                          Need Disambiguation?
                        </label>
                      </div>
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
                <TabsContent value="company">
                  <form
                    onSubmit={(e) => handleSearch(e, 'company')}
                    className="mt-8 space-y-3"
                  >
                    <div className="flex flex-col space-y-3">
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
                      <div className="flex items-center">
                        <UserSearch className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                        <Input
                          type="text"
                          placeholder="Title (optional)"
                          className="block w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                          value={companyTitle}
                          onChange={(e) => setCompanyTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="disambiguate-company"
                          checked={needDisambiguation}
                          onChange={(e) => setNeedDisambiguation(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="disambiguate-company" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                          Need Disambiguation?
                        </label>
                      </div>
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

        {/* Disambiguation Modal */}
        {isSuggestionModalOpen && (
          <Modal onClose={() => setIsSuggestionModalOpen(false)} title="Select the correct entity">
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                    <span>{suggestion}</span>
                    <Button
                      onClick={() => handleSuggestionSelect(suggestion)}
                      variant="outline"
                      size="sm"
                    >
                      Select
                    </Button>
                  </div>
                ))
              ) : (
                <p>No suggestions available.</p>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => setIsSuggestionModalOpen(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </Modal>
        )}

        {/* Removed Feedback Modal from search page */}
      </main>
    </div>
  );
}
